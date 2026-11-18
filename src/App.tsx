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
  const selectedStation = useMemo(() => getStation(selectedId) ?? stations[0], [selectedId])
  const selectedPortalUnlocked = isPortalUnlocked(mission, selectedStation.id)
  const progress = missionProgress(mission)

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
          setMode('nexus')
        }} mode={mode} station={selectedStation} />
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
            <button className="room-action secondary" type="button" onClick={() => setMode(returnToNexus({ mode, stationId: selectedId }).mode)}>Volver al Nexus</button>
          </> : <>
            {selectedPortalUnlocked ? (
              <button className="room-action" type="button" onClick={() => setMode(enterRoom(selectedId).mode)}>Entrar a {selectedStation.name}</button>
            ) : (
              <p className="portal-locked">Portal bloqueado: activa el núcleo de {selectedStation.name} para entrar.</p>
            )}
            <p className="hint">Activa núcleos en el panel de misión y usa las estaciones para cambiar de mundo.</p>
          </>}
        </aside>
      </section>

      <section className="accessibility-note" aria-label="Controles de la escena">
        <strong>Controles:</strong> arrastra para orbitar y usa la rueda para acercar. Selecciona un portal y entra a su sala para iniciar el recorrido guiado.
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
