import { useEffect, useMemo, useState } from 'react'
import { NexusScene } from './components/NexusScene'
import { getStation, stations } from './data/stations'
import { enterRoom, returnToNexus, type ExperienceMode } from './components/nexusNavigation'
import { activateCore, createMission, isPortalUnlocked, missionProgress } from './components/nexusMission'
import { activateRelic, answerMission, createExplorationProgress, createMissionState, isMissionReady, relicProgress, explorationCount, exploreStation, startMission, type RoomMissionState } from './components/nexusExploration'
import { clearExplorationProgress, loadExplorationProgress, saveExplorationProgress } from './components/nexusProgressStorage'
import './styles.css'

export default function App() {
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const [mode, setMode] = useState<ExperienceMode>('nexus')
  const [mission, setMission] = useState(createMission)
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [chosenOption, setChosenOption] = useState<number | null>(null)
  const [roomMission, setRoomMission] = useState<RoomMissionState>(() => createMissionState(stations[0].id))
  const [exploration, setExploration] = useState(() => typeof window === 'undefined' ? createExplorationProgress() : loadExplorationProgress(window.localStorage))
  const selectedStation = useMemo(() => getStation(selectedId) ?? stations[0], [selectedId])
  const progress = missionProgress(mission)
  const exploredCount = explorationCount(exploration)
  const activeRelics = relicProgress(roomMission)
  const missionReady = isMissionReady(roomMission)
  useEffect(() => {
    saveExplorationProgress(window.localStorage, exploration)
  }, [exploration])
  const leaveRoom = () => {
    setChallengeOpen(false)
    setChosenOption(null)
    setRoomMission(createMissionState(selectedId))
    setMode(returnToNexus({ mode, stationId: selectedId }).mode)
  }
  const enterSelectedRoom = () => {
    setChallengeOpen(false)
    setChosenOption(null)
    setRoomMission(createMissionState(selectedId))
    setMode(enterRoom(selectedId).mode)
  }

  return (
    <main className="game-shell">
      <section className="scene-layout" aria-label="Exploración 3D">
        <NexusScene onSelect={(id) => {
          setSelectedId(id)
          setChallengeOpen(false)
          setChosenOption(null)
          setRoomMission(createMissionState(id))
          setMode(enterRoom(id).mode)
        }} mode={mode} station={selectedStation} activeCoreIds={mission.activeCoreIds} onActivateCore={(id) => setMission((currentMission) => activateCore(currentMission, id))} onReturnToNexus={leaveRoom} missionState={roomMission} onActivateRelic={(relicId) => setRoomMission((current) => activateRelic(current, relicId))} onMissionAnswer={(option) => {
          const next = answerMission(roomMission, selectedStation, option)
          setChosenOption(option)
          setRoomMission(next)
          if (next.phase === 'success') setExploration((current) => exploreStation(current, selectedStation.id))
        }} />
        <header className="game-hud" aria-labelledby="page-title">
          <p className="eyebrow">NEXUS CENTRAL · EXPERIENCIA WEB 3D</p>
          <h1 id="page-title">Kitsune Nexus 3D</h1>
          <p className="hud-copy">Explora tres realidades, estabiliza sus núcleos y domina la composición 3D.</p>
          <div className="hud-progress"><span>Núcleos estabilizados: {progress}/3</span><span>Zonas exploradas: {exploredCount}/3</span></div>
        </header>
        <section className="mission-panel game-mission" aria-label="Misión del Nexus">
          <p className="panel-label">NÚCLEOS DE ENERGÍA</p>
          <div className="core-actions">
            {stations.map((station) => {
              const active = isPortalUnlocked(mission, station.id)
              return <button className={active ? 'core-action active' : 'core-action'} key={station.id} type="button" onClick={() => setMission((currentMission) => activateCore(currentMission, station.id))} disabled={active}>
                {active ? `Núcleo de ${station.name} activo` : `Activar núcleo de ${station.name}`}
              </button>
            })}
          </div>
          {progress === stations.length && <p className="mission-complete" role="status">Nexus estabilizado.</p>}
          {exploredCount > 0 && <button className="room-action secondary reset-action" type="button" onClick={() => { clearExplorationProgress(window.localStorage); setExploration(createExplorationProgress()) }}>Reiniciar</button>}
        </section>
        <aside className="station-panel" aria-live="polite">
          <p className="panel-label">{mode === 'room' ? 'SALA ACTIVA' : 'ESTACIÓN SELECCIONADA'}</p>
          <h2>{mode === 'room' ? `Sala: ${selectedStation.name}` : selectedStation.name}</h2>
          <p>{mode === 'room' ? selectedStation.room.mission : selectedStation.description}</p>
          <div className="theme-swatches" aria-label={`Colores de ${selectedStation.name}`}>
            <span style={{ background: selectedStation.theme.primary }} />
            <span style={{ background: selectedStation.theme.secondary }} />
          </div>
          {mode === 'room' ? <>
            <ul className="learning-points">{selectedStation.room.learningPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            {roomMission.phase === 'void' ? <section className="challenge-card" aria-label="Misión perdida">
              <p className="panel-label">FALLA DIMENSIONAL</p>
              <p className="challenge-feedback">Misión perdida · Lumi cayó en la grieta dimensional. Regresa al Nexus y entra de nuevo para reintentar.</p>
            </section> : roomMission.phase === 'success' ? <section className="challenge-card" aria-label="Misión completada">
              <p className="panel-label">HABILIDAD DESBLOQUEADA</p>
              <p className="challenge-feedback correct">{roomMission.reward?.icon} {roomMission.reward?.name}</p>
              <p className="challenge-feedback">{selectedStation.room.challenge.explanation}</p>
            </section> : challengeOpen ? <section className="challenge-card" aria-label="Desafío de exploración">
              <p className="panel-label">DESAFÍO EN ESCENA</p>
              <p className="challenge-feedback">Explora la sala y sincroniza los tres fragmentos de resonancia. Cada uno puede activarse con <strong>E</strong> cerca de él o con clic en la escena.</p>
              <p className="mission-progress">Fragmentos sincronizados: {activeRelics}/3</p>
              <div className="core-actions">
                {[0, 1, 2].map((relicId) => <button className={roomMission.activatedRelicIds.includes(relicId) ? 'core-action active' : 'core-action'} key={relicId} type="button" disabled={roomMission.activatedRelicIds.includes(relicId)} onClick={() => setRoomMission((current) => activateRelic(current, relicId))}>Sincronizar fragmento {relicId + 1}</button>)}
              </div>
              <p className="challenge-feedback">{missionReady ? 'Las compuertas se materializaron: llega a una ruta, salta para elegir o usa E.' : 'Las compuertas aparecerán al sincronizar los tres fragmentos.'}</p>
              <p className="mission-progress">Fallas de estabilidad: {roomMission.failures}/2</p>
              <p className="challenge-feedback">Una primera falla altera el núcleo. A la segunda, la grieta dimensional se abre bajo la exploradora.</p>
            </section> : <button className="room-action" type="button" onClick={() => { setChallengeOpen(true); setChosenOption(null); setRoomMission(startMission(createMissionState(selectedStation.id))) }}>Activar misión 3D</button>}
            <button className="room-action secondary" type="button" onClick={leaveRoom}>Volver al Nexus</button>
          </> : <>
            <button className="room-action" type="button" onClick={enterSelectedRoom}>Entrar a {selectedStation.name}</button>
            <p className="hint">Los núcleos son opcionales: entra a cualquier portal, completa el desafío si quieres y vuelve para explorar otro.</p>
          </>}
        </aside>
        <nav aria-label="Estaciones del Nexus" className="station-nav game-nav">
          {stations.map((station) => (
            <button className={station.id === selectedStation.id ? 'station-button selected' : 'station-button'} key={station.id} type="button" onClick={() => {
              setSelectedId(station.id)
              setMode('nexus')
              setChallengeOpen(false)
              setChosenOption(null)
              setRoomMission(createMissionState(station.id))
            }}>
              <span>{station.name}</span><small>{station.subtitle}</small>
            </button>
          ))}
        </nav>
        <details className="profile-dock">
          <summary>Perfil del explorador</summary>
          <section className="explorer-archive" aria-labelledby="archive-title">
            <div className="archive-intro">
              <p className="eyebrow">REGISTRO DEL NEXUS · PERFIL</p>
              <h2 id="archive-title">Archivo del Explorador</h2>
              <p className="archive-name">Luis Carabalí Rivera</p>
              <p className="archive-role">Desarrollador de Software · Backend &amp; Fullstack</p>
              <p>Desarrollador de software en Cali, Colombia, con experiencia en aplicaciones web, APIs, bases de datos relacionales e infraestructura cloud. Combino ese enfoque técnico con experimentación en experiencias Web 3D interactivas.</p>
              <a className="archive-link" href="https://github.com/LuisCarabaliR/kitsune-nexus-3d" target="_blank" rel="noreferrer">Ver repositorio ↗</a>
            </div>
            <div className="archive-grid">
              <article><p className="panel-label">HABILIDADES ACTIVAS</p><div className="skill-tags"><span>JavaScript</span><span>TypeScript</span><span>SQL</span><span>React</span><span>Three.js</span><span>AWS</span><span>Docker</span></div></article>
              <article><p className="panel-label">PROYECTO DESTACADO</p><h3>Kitsune Nexus 3D</h3><p>Hub interactivo con portales, salas temáticas, cámara 3D y aprendizaje visual.</p></article>
              <article><p className="panel-label">TRAYECTORIA</p><p>Consultor IT independiente desde 2024. Formación en Ingeniería de Sistemas y Tecnólogo en Sistemas de Información.</p></article>
            </div>
          </section>
        </details>
        <p className="accessibility-note" aria-label="Controles de la escena"><strong>Controles:</strong> W, A, S, D o flechas para moverte · Espacio para saltar · Arrastra con el mouse y usa la rueda para observar cada escenario · E para activar puertas de misión · Acércate a un portal para entrar.</p>
      </section>
    </main>
  )
}
