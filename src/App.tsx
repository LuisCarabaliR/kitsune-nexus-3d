import { useMemo, useState } from 'react'
import { NexusScene } from './components/NexusScene'
import { getStation, stations } from './data/stations'
import './styles.css'

export default function App() {
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const selectedStation = useMemo(() => getStation(selectedId) ?? stations[0], [selectedId])

  return (
    <main className="app-shell">
      <section className="hero-copy" aria-labelledby="page-title">
        <p className="eyebrow">NEXUS CENTRAL · EXPERIENCIA WEB 3D</p>
        <h1 id="page-title">Kitsune Nexus 3D</h1>
        <p className="intro">
          Una experiencia interactiva de aprendizaje sobre composición, materiales y puesta en escena en mundos anime-futuristas.
        </p>
        <nav aria-label="Estaciones del Nexus" className="station-nav">
          {stations.map((station) => (
            <button
              className={station.id === selectedStation.id ? 'station-button selected' : 'station-button'}
              key={station.id}
              type="button"
              onClick={() => setSelectedId(station.id)}
            >
              <span>{station.name}</span>
              <small>{station.subtitle}</small>
            </button>
          ))}
        </nav>
      </section>

      <section className="scene-layout" aria-label="Exploración 3D">
        <NexusScene onSelect={setSelectedId} />
        <aside className="station-panel" aria-live="polite">
          <p className="panel-label">ESTACIÓN SELECCIONADA</p>
          <h2>{selectedStation.name}</h2>
          <p>{selectedStation.description}</p>
          <div className="theme-swatches" aria-label={`Colores de ${selectedStation.name}`}>
            <span style={{ background: selectedStation.theme.primary }} />
            <span style={{ background: selectedStation.theme.secondary }} />
          </div>
          <p className="hint">Haz clic en un portal o usa las estaciones para cambiar de mundo.</p>
        </aside>
      </section>

      <section className="accessibility-note" aria-label="Controles de la escena">
        <strong>Controles:</strong> arrastra para orbitar, usa la rueda para acercar y selecciona un portal para conocer su estación.
      </section>
    </main>
  )
}
