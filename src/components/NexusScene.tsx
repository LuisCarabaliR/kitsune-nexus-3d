import { ContactShadows, Float, OrbitControls, Sparkles, Stars, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { stations, type Station } from '../data/stations'
import { NexusPortal } from './NexusPortal'
import { NexusRoom } from './NexusRoom'
import { NexusExplorer } from './NexusExplorer'
import { NexusEnergyCore } from './NexusEnergyCore'
import type { ExperienceMode } from './nexusNavigation'
import { portalAtPosition } from './nexusSceneModel'
import { plazaCameraPose } from './plazaCamera'
import { roomCameraOrbit } from './roomCameraControls'
import { Suspense, useRef } from 'react'
import type { RoomMissionState } from './nexusExploration'

type NexusSceneProps = {
  onSelect: (id: Station['id']) => void
  mode?: ExperienceMode
  station?: Station
  activeCoreIds?: readonly Station['id'][]
  onActivateCore?: (id: Station['id']) => void
  onReturnToNexus?: () => void
  missionState?: RoomMissionState
  onMissionAnswer?: (option: number) => void
}

const corePositions: Record<Station['id'], [number, number, number]> = {
  neon: [-10.5, -0.25, -5.5],
  wind: [0, 0.2, -12],
  mecha: [10.5, -0.25, -5.5],
}
const plazaExplorerStart: [number, number, number] = [0, -0.7, 9]
const initialPlazaCamera = plazaCameraPose(plazaExplorerStart)

type NexusPlazaProps = {
  activeCoreIds: readonly Station['id'][]
  onActivateCore: (id: Station['id']) => void
  onSelect: (id: Station['id']) => void
}

function NexusPlaza({ activeCoreIds, onActivateCore, onSelect }: NexusPlazaProps) {
  const stabilized = activeCoreIds.length === stations.length
  const enteredPortal = useRef<Station['id'] | null>(null)

  const handleExplorerMove = (position: [number, number, number]) => {
    const portalId = portalAtPosition(position, stations)
    if (!portalId) {
      enteredPortal.current = null
      return
    }
    if (enteredPortal.current === portalId) return
    enteredPortal.current = portalId
    onSelect(portalId)
  }

  return <>
    <color attach="background" args={['#08051a']} />
    <fog attach="fog" args={['#08051a', 25, 78]} />
    <hemisphereLight args={['#b7c8ff', '#110722', 1.05]} />
    <ambientLight intensity={0.22} />
    <directionalLight position={[5, 16, 8]} intensity={2.3} color="#b8d9ff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-far={70} />
    <pointLight position={[0, 2, 1]} intensity={stabilized ? 22 : 13} color={stabilized ? '#73ffd5' : '#995cff'} distance={30} />
    <Stars radius={120} depth={50} count={1900} factor={2.5} saturation={0.6} fade speed={0.7} />
    <Sparkles count={620} scale={[68, 14, 68]} size={2.3} speed={0.25} color={stabilized ? '#8dffe6' : '#7cecff'} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
      <circleGeometry args={[36, 180]} />
      <meshPhysicalMaterial color="#120b34" metalness={0.78} roughness={0.24} clearcoat={0.32} clearcoatRoughness={0.3} />
    </mesh>
    <ContactShadows position={[0, -1.22, 0]} opacity={0.42} scale={62} blur={2.6} far={14} color="#120529" />
    {[3.1, 7.2, 12.2, 18.5, 26, 33].map((radius, index) => <mesh key={radius} position={[0, -1.17 + index * 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, index === 0 ? 0.08 : 0.035, 12, 112]} />
      <meshStandardMaterial color={index === 0 && stabilized ? '#73ffd5' : '#8458ff'} emissive={index === 0 && stabilized ? '#73ffd5' : '#5939cf'} emissiveIntensity={index === 0 ? 2.5 : 0.72} metalness={0.92} roughness={0.16} />
    </mesh>)}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const angle = (index / 8) * Math.PI * 2
      return <group key={index} position={[Math.cos(angle) * 28, -0.15, Math.sin(angle) * 28]} rotation={[0, -angle, 0]}>
        <mesh castShadow><boxGeometry args={[0.55, 2.8 + (index % 2) * 1.3, 0.55]} /><meshStandardMaterial color="#2d1e62" emissive="#3d2086" emissiveIntensity={0.75} metalness={0.85} roughness={0.2} /></mesh>
        <mesh position={[0, 1.9, 0]}><octahedronGeometry args={[0.28, 0]} /><meshStandardMaterial color="#7cecff" emissive="#41bcff" emissiveIntensity={1.8} /></mesh>
      </group>
    })}
    {stations.map((station, index) => {
      const [x, , z] = station.theme.position
      const districtX = x
      const districtZ = z
      const angle = Math.atan2(districtX, districtZ)
      const bridgeLength = Math.hypot(districtX, districtZ) - 5.2
      return <group key={`district-${station.id}`}>
        <mesh position={[districtX / 2, -1.18, districtZ / 2]} rotation={[0, -angle, 0]}>
          <boxGeometry args={[1.55, 0.16, bridgeLength]} />
          <meshStandardMaterial color="#2a1c5e" emissive={station.theme.primary} emissiveIntensity={0.5} metalness={0.85} roughness={0.22} />
        </mesh>
        <mesh position={[districtX, -1.18, districtZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4.5, 80]} />
          <meshStandardMaterial color="#17113e" emissive={station.theme.primary} emissiveIntensity={0.5 + index * 0.1} metalness={0.9} roughness={0.2} />
        </mesh>
        {[0, 1, 2].map((marker) => {
          const markerAngle = (marker / 3) * Math.PI * 2 + 0.4
          return <Float key={marker} speed={1 + marker * 0.2} rotationIntensity={0.35} floatIntensity={0.45}>
            <group position={[districtX + Math.cos(markerAngle) * 3.35, 0.25 + marker * 0.35, districtZ + Math.sin(markerAngle) * 3.35]}>
              <mesh><octahedronGeometry args={[0.32, 0]} /><meshStandardMaterial color={station.theme.secondary} emissive={station.theme.primary} emissiveIntensity={1.25} metalness={0.85} roughness={0.18} /></mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.5, 0.025, 8, 32]} /><meshBasicMaterial color={station.theme.secondary} /></mesh>
            </group>
          </Float>
        })}
        <Text position={[districtX, -0.55, districtZ + 3.55]} fontSize={0.22} color={station.theme.secondary} anchorX="center">{station.name.toUpperCase()} · DISTRITO</Text>
      </group>
    })}
    <group position={[0, 0.1, 0]}>
      <mesh><icosahedronGeometry args={[1.25, 2]} /><meshStandardMaterial color={stabilized ? '#a1ffe5' : '#c077ff'} emissive={stabilized ? '#4dffd0' : '#7d45ef'} emissiveIntensity={2.3} metalness={0.78} roughness={0.14} /></mesh>
      <mesh rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[1.8, 0.055, 12, 88]} /><meshBasicMaterial color={stabilized ? '#77ffe1' : '#a175ff'} /></mesh>
      <mesh rotation={[0, Math.PI / 2.8, Math.PI / 2]}><torusGeometry args={[2.18, 0.035, 12, 88]} /><meshBasicMaterial color="#7cecff" transparent opacity={0.7} /></mesh>
    </group>
    {stations.map((item) => <NexusEnergyCore key={`core-${item.id}`} station={item} position={corePositions[item.id]} active={activeCoreIds.includes(item.id)} onActivate={onActivateCore} />)}
    {stations.map((item) => <NexusPortal key={item.id} station={item} unlocked onSelect={onSelect} />)}
    <Text position={[0, 0.55, -2.8]} fontSize={0.22} color="#d8d1ff" anchorX="center">PLAZA CENTRAL · ELIGE UN DISTRITO</Text>
    <Suspense fallback={null}><NexusExplorer initialPosition={plazaExplorerStart} onMove={handleExplorerMove} /></Suspense>
  </>
}

export function NexusScene({ onSelect, mode = 'nexus', station = stations[0], activeCoreIds = [], onActivateCore = () => {}, onReturnToNexus = () => {}, missionState, onMissionAnswer = () => {} }: NexusSceneProps) {
  return (
    <div className="nexus-canvas" role="img" aria-label="Escena 3D del Nexus Central con tres portales explorables">
      <Canvas camera={{ position: initialPlazaCamera.position, fov: 54 }} shadows dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          {mode === 'room' ? <NexusRoom station={station} onReturn={onReturnToNexus} missionState={missionState} onMissionAnswer={onMissionAnswer} /> : <NexusPlaza activeCoreIds={activeCoreIds} onActivateCore={onActivateCore} onSelect={onSelect} />}
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          target={mode === 'nexus' ? initialPlazaCamera.target : [0, 0.35, 1]}
          minDistance={mode === 'nexus' ? 16 : roomCameraOrbit.minDistance}
          maxDistance={mode === 'nexus' ? 48 : roomCameraOrbit.maxDistance}
          minPolarAngle={mode === 'nexus' ? 0 : roomCameraOrbit.minPolarAngle}
          maxPolarAngle={mode === 'nexus' ? Math.PI / 2.05 : roomCameraOrbit.maxPolarAngle}
        />
      </Canvas>
    </div>
  )
}
