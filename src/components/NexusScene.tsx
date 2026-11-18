import { OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { stations, type Station } from '../data/stations'
import { NexusPortal } from './NexusPortal'
import { NexusRoom } from './NexusRoom'
import { NexusExplorer } from './NexusExplorer'
import { NexusEnergyCore } from './NexusEnergyCore'
import type { ExperienceMode } from './nexusNavigation'

type NexusSceneProps = {
  onSelect: (id: Station['id']) => void
  mode?: ExperienceMode
  station?: Station
  activeCoreIds?: readonly Station['id'][]
  onActivateCore?: (id: Station['id']) => void
}

const corePositions: Record<Station['id'], [number, number, number]> = {
  neon: [-6.2, -0.25, 2.4],
  wind: [0, 0.2, -5.8],
  mecha: [6.2, -0.25, 2.4],
}

type NexusPlazaProps = {
  activeCoreIds: readonly Station['id'][]
  onActivateCore: (id: Station['id']) => void
  onSelect: (id: Station['id']) => void
}

function NexusPlaza({ activeCoreIds, onActivateCore, onSelect }: NexusPlazaProps) {
  const stabilized = activeCoreIds.length === stations.length

  return <>
    <color attach="background" args={['#08051a']} />
    <fog attach="fog" args={['#08051a', 10, 28]} />
    <ambientLight intensity={0.45} />
    <directionalLight position={[5, 10, 4]} intensity={2.8} color="#b8d9ff" castShadow />
    <pointLight position={[0, 2, 1]} intensity={stabilized ? 34 : 20} color={stabilized ? '#73ffd5' : '#995cff'} distance={14} />
    <Stars radius={70} depth={36} count={1500} factor={2.5} saturation={0.6} fade speed={0.7} />
    <Sparkles count={280} scale={[22, 9, 22]} size={2.3} speed={0.25} color={stabilized ? '#8dffe6' : '#7cecff'} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
      <circleGeometry args={[11, 112]} />
      <meshStandardMaterial color="#120b34" metalness={0.86} roughness={0.3} />
    </mesh>
    {[3.1, 6.1, 9.1].map((radius, index) => <mesh key={radius} position={[0, -1.17 + index * 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, index === 0 ? 0.08 : 0.035, 12, 112]} />
      <meshStandardMaterial color={index === 0 && stabilized ? '#73ffd5' : '#8458ff'} emissive={index === 0 && stabilized ? '#73ffd5' : '#5939cf'} emissiveIntensity={index === 0 ? 2.5 : 0.72} metalness={0.92} roughness={0.16} />
    </mesh>)}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const angle = (index / 8) * Math.PI * 2
      return <group key={index} position={[Math.cos(angle) * 8.6, -0.15, Math.sin(angle) * 8.6]} rotation={[0, -angle, 0]}>
        <mesh castShadow><boxGeometry args={[0.55, 2.8 + (index % 2) * 1.3, 0.55]} /><meshStandardMaterial color="#2d1e62" emissive="#3d2086" emissiveIntensity={0.75} metalness={0.85} roughness={0.2} /></mesh>
        <mesh position={[0, 1.9, 0]}><octahedronGeometry args={[0.28, 0]} /><meshStandardMaterial color="#7cecff" emissive="#41bcff" emissiveIntensity={1.8} /></mesh>
      </group>
    })}
    <group position={[0, 0.1, 0]}>
      <mesh><icosahedronGeometry args={[1.25, 2]} /><meshStandardMaterial color={stabilized ? '#a1ffe5' : '#c077ff'} emissive={stabilized ? '#4dffd0' : '#7d45ef'} emissiveIntensity={2.3} metalness={0.78} roughness={0.14} /></mesh>
      <mesh rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[1.8, 0.055, 12, 88]} /><meshBasicMaterial color={stabilized ? '#77ffe1' : '#a175ff'} /></mesh>
      <mesh rotation={[0, Math.PI / 2.8, Math.PI / 2]}><torusGeometry args={[2.18, 0.035, 12, 88]} /><meshBasicMaterial color="#7cecff" transparent opacity={0.7} /></mesh>
    </group>
    {stations.map((item) => <NexusEnergyCore key={`core-${item.id}`} station={item} position={corePositions[item.id]} active={activeCoreIds.includes(item.id)} onActivate={onActivateCore} />)}
    {stations.map((item) => <NexusPortal key={item.id} station={item} unlocked onSelect={onSelect} />)}
    <NexusExplorer />
  </>
}

export function NexusScene({ onSelect, mode = 'nexus', station = stations[0], activeCoreIds = [], onActivateCore = () => {} }: NexusSceneProps) {
  return (
    <div className="nexus-canvas" role="img" aria-label="Escena 3D del Nexus Central con tres portales explorables">
      <Canvas camera={{ position: [0, 3, 10], fov: 48 }} shadows dpr={[1, 1.75]}>
        {mode === 'room' ? <NexusRoom station={station} /> : <NexusPlaza activeCoreIds={activeCoreIds} onActivateCore={onActivateCore} onSelect={onSelect} />}
        <OrbitControls enablePan={false} minDistance={mode === 'room' ? 5 : 8} maxDistance={20} maxPolarAngle={Math.PI / 2.05} autoRotate={mode === 'room'} autoRotateSpeed={0.55} />
      </Canvas>
    </div>
  )
}
