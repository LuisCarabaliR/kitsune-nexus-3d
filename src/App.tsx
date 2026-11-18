import { useMemo, useState } from 'react'
import { NexusScene } from './components/NexusScene'
import { getStation, stations } from './data/stations'
import { enterRoom, returnToNexus, type ExperienceMode } from './components/nexusNavigation'
import { activateCore, createMission, isPortalUnlocked, missionProgress } from './components/nexusMission'
import './styles.css'

export default function App() {
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const [mode, setMode] = useState<ExperienceMode>('nexus')
  const [mission, setMission] = useState(createMission)
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [chosenOption, setChosenOption] = useState<number | null>(null)
  const selectedStation = useMemo(() => getStation(selectedId) ?? stations[0], [selectedId])
  const progress = missionProgress(mission)
  const leaveRoom = () => {
    setChallengeOpen(false)
    setChosenOption(null)
    setMode(returnToNexus({ mode, stationId: selectedId }).mode)
  }
  const enterSelectedRoom = () => {
    setChallengeOpen(false)
    setChosenOption(null)
    setMode(enterRoom(selectedId).mode)
  }

  return (
    <main className="app-shell">
      <section className="hero-copy" aria-labelledby="page-title">
        <p className="eyebrow">NEXUS CENTRAL · EXPERIENCIA WEB 3D</p>
        <h1 id="page-title">Kitsune Nexus 3D</h1>
        <p className="intro">
          Una experiencia interactiva de aprendizaje sobre composición, materiales y puesta en escena en mundos anime-futuristas.
        </p>
        <section className="mission-panel" aria-label="Misión del Nexus">
          <div>
            <p className="panel-label">MISIÓN · ESTABILIZAR EL NEXUS</p>
            <p className="mission-progress">Núcleos estabilizados: {progress}/3</p>
            <p className="mission-copy">Activa los núcleos de energía para abrir cada portal y restaurar el equilibrio de la plaza.</p>
          </div>
          <div className="core-actions">
            {stations.map((station) => {
              const active = isPortalUnlocked(mission, station.id)
              return (
                <button
                  className={active ? 'core-action active' : 'core-action'}
                  key={station.id}
                  type="button"
                  onClick={() => setMission((currentMission) => activateCore(currentMission, station.id))}
                  disabled={active}
                >
                  {active ? `Núcleo de ${station.name} activo` : `Activar núcleo de ${station.name}`}
                </button>
              )
            })}
          </div>
          {progress === stations.length && <p className="mission-complete" role="status">Nexus estabilizado: los tres portales están disponibles.</p>}
        </section>
        <nav aria-label="Estaciones del Nexus" className="station-nav">
          {stations.map((station) => (
            <button
              className={station.id === selectedStation.id ? 'station-button selected' : 'station-button'}
              key={station.id}
              type="button"
              onClick={() => {
                setSelectedId(station.id)
                setMode('nexus')
                setChallengeOpen(false)
                setChosenOption(null)
              }}
            >
              <span>{station.name}</span>
              <small>{station.subtitle}</small>
            </button>
          ))}
        </nav>
      </section>

      <section className="scene-layout" aria-label="Exploración 3D">
        <NexusScene onSelect={(id) => {
          setSelectedId(id)
          setChallengeOpen(false)
          setChosenOption(null)
          setMode(enterRoom(id).mode)
        }} mode={mode} station={selectedStation} activeCoreIds={mission.activeCoreIds} onActivateCore={(id) => setMission((currentMission) => activateCore(currentMission, id))} />
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
            {challengeOpen ? <section className="challenge-card" aria-label="Desafío opcional">
              <p className="panel-label">DESAFÍO OPCIONAL</p>
              <p className="challenge-question">{selectedStation.room.challenge.question}</p>
              <div className="challenge-options">
                {selectedStation.room.challenge.options.map((option, index) => <button key={option} type="button" onClick={() => setChosenOption(index)}>{option}</button>)}
              </div>
              {chosenOption !== null && <p className={chosenOption === selectedStation.room.challenge.correctOption ? 'challenge-feedback correct' : 'challenge-feedback'}>{chosenOption === selectedStation.room.challenge.correctOption ? `Correcto. ${selectedStation.room.challenge.explanation}` : `Inténtalo de nuevo. ${selectedStation.room.challenge.explanation}`}</p>}
              <button className="room-action secondary" type="button" onClick={() => { setChallengeOpen(false); setChosenOption(null) }}>Seguir explorando</button>
            </section> : <button className="room-action" type="button" onClick={() => setChallengeOpen(true)}>Iniciar desafío opcional</button>}
            <button className="room-action secondary" type="button" onClick={leaveRoom}>Volver al Nexus</button>
          </> : <>
            <button className="room-action" type="button" onClick={enterSelectedRoom}>Entrar a {selectedStation.name}</button>
            <p className="hint">Los núcleos son opcionales: entra a cualquier portal, completa el desafío si quieres y vuelve para explorar otro.</p>
          </>}
        </aside>
      </section>

      <section className="accessibility-note" aria-label="Controles de la escena">
        <strong>Controles:</strong> usa W, A, S, D o flechas para mover el explorador; las estructuras y el borde de la plaza bloquean el paso. Haz clic en un portal para entrar a su sala.
      </section>

      <section className="explorer-archive" aria-labelledby="archive-title">
        <div className="archive-intro">
          <p className="eyebrow">REGISTRO DEL NEXUS · PERFIL</p>
          <h2 id="archive-title">Archivo del Explorador</h2>
          <p className="archive-name">Luis Carabalí Rivera</p>
          <p className="archive-role">Desarrollador de Software · Backend &amp; Fullstack</p>
          <p>
            Desarrollador de software en Cali, Colombia, con experiencia en aplicaciones web, APIs, bases de datos relacionales e
            infraestructura cloud. Combino ese enfoque técnico con experimentación en experiencias Web 3D interactivas.
          </p>
          <a className="archive-link" href="https://github.com/LuisCarabaliR/kitsune-nexus-3d" target="_blank" rel="noreferrer">
            Ver repositorio ↗
          </a>
        </div>
        <div className="archive-grid">
          <article>
            <p className="panel-label">HABILIDADES ACTIVAS</p>
            <div className="skill-tags"><span>JavaScript</span><span>TypeScript</span><span>SQL</span><span>React</span><span>Three.js</span><span>AWS</span><span>Docker</span></div>
          </article>
          <article>
            <p className="panel-label">PROYECTO DESTACADO</p>
            <h3>Kitsune Nexus 3D</h3>
            <p>Hub interactivo con portales, salas temáticas, cámara 3D y aprendizaje visual.</p>
          </article>
          <article>
            <p className="panel-label">TRAYECTORIA</p>
            <p>Consultor IT independiente desde 2024. Formación en Ingeniería de Sistemas y Tecnólogo en Sistemas de Información.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
