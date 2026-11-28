import { ContactShadows, Float, Sparkles, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Station } from '../data/stations'
import { VrmLumi } from './NexusExplorer'
import { advanceJump, moveRoomExplorer, movementFromKeys, smoothTurn, smoothVelocity } from './roomMovement'
import { isMissionReady, missionGateAtPosition, missionRelicPositions, relicAtPosition, selectGateOnJump, type RoomMissionState } from './nexusExploration'
import { MissionCourse } from './missionCourse'
import { WorldScenery } from './WorldScenery'

type NexusRoomProps = {
  station: Station
  onReturn: () => void
  missionState?: RoomMissionState
  onMissionAnswer: (option: number) => void
  onActivateRelic: (relicId: number) => void
}

function RoomNavigator({ station, missionActive, missionReady, celebrating, onMissionAnswer, onActivateRelic, onReturn }: Pick<NexusRoomProps, 'station' | 'onMissionAnswer' | 'onActivateRelic' | 'onReturn'> & { missionActive: boolean, missionReady: boolean, celebrating: boolean }) {
  const pressedKeys = useRef(new Set<string>())
  const moving = useRef(false)
  const jumpQueued = useRef(false)
  const jump = useRef({ height: 0, velocity: 0 })
  const velocity = useRef<[number, number, number]>([0, 0, 0])
  const interactQueued = useRef(false)
  const explorer = useRef<Group>(null)
  const returning = useRef(false)
  const { camera, controls } = useThree()

  useEffect(() => {
    camera.position.set(0, 2.5, 9)
    camera.lookAt(0, 0.35, 1)
  }, [camera])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) jumpQueued.current = true
      }
      if (event.code === 'KeyE' && missionActive && !event.repeat) {
        event.preventDefault()
        interactQueued.current = true
      }
      pressedKeys.current.add(event.code)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') event.preventDefault()
      pressedKeys.current.delete(event.code)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [missionActive])

  useFrame((_, delta) => {
    if (!explorer.current) return
    const direction = movementFromKeys(pressedKeys.current)
    velocity.current = smoothVelocity(velocity.current, direction, delta, 2.85)
    const [x, , z] = velocity.current
    moving.current = Math.hypot(x, z) > 0.15
    const jumped = jumpQueued.current
    jump.current = advanceJump(jump.current, jumped, delta)
    jumpQueued.current = false
    explorer.current.position.y = -0.7 + jump.current.height
    if (moving.current) {
      const next = moveRoomExplorer(station.id, [explorer.current.position.x, 0, explorer.current.position.z], velocity.current, delta)
      const dx = next[0] - explorer.current.position.x
      const dz = next[2] - explorer.current.position.z
      const orbit = controls as OrbitControlsImpl | null
      if (orbit) { orbit.target.x += dx; orbit.target.z += dz; camera.position.x += dx; camera.position.z += dz }
      explorer.current.position.x = next[0]
      explorer.current.position.z = next[2]
      if (!returning.current && Math.hypot(next[0], next[2] - 8) < 0.9) {
        returning.current = true
        onReturn()
        return
      }
      if (direction[0] || direction[2]) explorer.current.rotation.y = smoothTurn(explorer.current.rotation.y, Math.atan2(direction[0], direction[2]), delta)
    }
    if (interactQueued.current) {
      const position: [number, number, number] = [explorer.current.position.x, 0, explorer.current.position.z]
      const relicId = relicAtPosition(position)
      if (relicId !== null) onActivateRelic(relicId)
      else if (missionReady) {
        const selectedGate = missionGateAtPosition(position)
        if (selectedGate !== null) onMissionAnswer(selectedGate)
      }
      interactQueued.current = false
    }
    if (missionReady) {
      const selectedGate = selectGateOnJump([explorer.current.position.x, 0, explorer.current.position.z], jumped)
      if (selectedGate !== null) onMissionAnswer(selectedGate)
    }
  })

  return <group ref={explorer} position={[0, -0.7, 4.4]}>
    <group position={[0, 0.55, 0]}>
      <VrmLumi moving={moving} celebrating={celebrating} />
      <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.58, 0.67, 40]} /><meshBasicMaterial color="#b486ff" transparent opacity={0.78} /></mesh>
    </group>
  </group>
}

function MissionRelics({ station, activatedRelicIds, onActivateRelic }: { station: Station, activatedRelicIds: readonly number[], onActivateRelic: (relicId: number) => void }) {
  return <group>
    {missionRelicPositions.map(([x, , z], index) => {
      const activated = activatedRelicIds.includes(index)
      return <Float key={index} speed={1.05 + index * 0.12} floatIntensity={0.34} rotationIntensity={0.28}>
        <group position={[x, -0.35, z]} onClick={(event) => { event.stopPropagation(); onActivateRelic(index) }}>
          <mesh castShadow><octahedronGeometry args={[0.48, 1]} /><meshStandardMaterial color={activated ? '#97ffe5' : station.theme.primary} emissive={activated ? '#45e9bc' : station.theme.secondary} emissiveIntensity={activated ? 2.1 : 1.25} metalness={0.82} roughness={0.12} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.72, 0.045, 10, 42]} /><meshBasicMaterial color={activated ? '#ffffff' : station.theme.secondary} transparent opacity={0.86} /></mesh>
          <pointLight color={activated ? '#8dffe3' : station.theme.secondary} intensity={activated ? 6 : 3.2} distance={4.5} />
          <Text position={[0, 0.92, 0]} fontSize={0.14} color="#ffffff" anchorX="center">{activated ? `FRAGMENTO ${index + 1} · ACTIVO` : `FRAGMENTO ${index + 1}`}</Text>
        </group>
      </Float>
    })}
  </group>
}

function RewardPulse({ name, icon }: { name: string, icon: string }) {
  const reward = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!reward.current) return
    reward.current.rotation.y = clock.elapsedTime * 0.9
    reward.current.position.y = 0.35 + Math.sin(clock.elapsedTime * 2.2) * 0.16
  })

  return <group ref={reward} position={[0, 0.35, 2.65]}>
    <pointLight color="#a7fff1" intensity={18} distance={7} />
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.12, 0.1, 16, 64]} /><meshStandardMaterial color="#66ffd8" emissive="#66ffd8" emissiveIntensity={3.2} metalness={0.88} roughness={0.12} /></mesh>
    <mesh><octahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color="#fff8c7" emissive="#b9ffea" emissiveIntensity={2.8} metalness={0.7} roughness={0.1} /></mesh>
    <Text position={[0, 1.35, 0]} fontSize={0.22} color="#b9ffea" anchorX="center">MISIÓN ESTABILIZADA</Text>
    <Text position={[0, 0.93, 0]} fontSize={0.17} color="#ffffff" anchorX="center">{`RECOMPENSA · ${icon} ${name}`}</Text>
  </group>
}

function VoidRift() {
  const rift = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (rift.current) rift.current.rotation.z = clock.elapsedTime * 0.55
  })
  return <group ref={rift} position={[0, -0.95, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh><torusGeometry args={[2.4, 0.22, 18, 88]} /><meshStandardMaterial color="#ff3b9d" emissive="#7d004c" emissiveIntensity={4} /></mesh>
    <mesh><circleGeometry args={[2.25, 64]} /><meshBasicMaterial color="#06000f" transparent opacity={0.92} /></mesh>
    <pointLight color="#ff2e9a" intensity={22} distance={9} />
    <Text position={[0, -2.8, 0]} rotation={[Math.PI / 2, 0, 0]} fontSize={0.24} color="#ffd2eb" anchorX="center">GRIETA DIMENSIONAL · MISIÓN FALLIDA</Text>
  </group>
}

function MissionGate({ station, option, index, onAnswer }: { station: Station, option: string, index: number, onAnswer: (option: number) => void }) {
  const gate = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!gate.current) return
    gate.current.rotation.y = Math.sin(clock.elapsedTime * 1.15 + index) * 0.16
    gate.current.position.y = Math.sin(clock.elapsedTime * 2 + index) * 0.1
  })

  const x = (index - 1) * 2.15
  return <group ref={gate} position={[x, 0, 0]} onClick={(event) => { event.stopPropagation(); onAnswer(index) }}>
    <mesh castShadow><boxGeometry args={[1.35, 2.2, 0.32]} /><meshStandardMaterial color={station.theme.primary} emissive={station.theme.primary} emissiveIntensity={1.35} metalness={0.82} roughness={0.18} /></mesh>
    <mesh position={[0, 0.1, 0.2]}><circleGeometry args={[0.35, 24]} /><meshBasicMaterial color={station.theme.secondary} /></mesh>
    <mesh position={[0, 0.1, 0.24]} rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[0.5, 0.045, 10, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.76} /></mesh>
    <pointLight position={[0, 0.25, 0.35]} color={station.theme.secondary} intensity={4.8} distance={3.4} />
    <Text position={[0, 1.33, 0.25]} maxWidth={1.35} fontSize={0.13} color="#ffffff" anchorX="center" textAlign="center">{option}</Text>
  </group>
}

function RoomArchitecture({ station }: Pick<NexusRoomProps, 'station'>) {
  const orbit = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (orbit.current) orbit.current.rotation.y = clock.elapsedTime * 0.18
  })

  return (
    <group ref={orbit}>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2 + Math.PI / 6
        return (
          <Float key={index} speed={1.1 + index * 0.05} rotationIntensity={0.18} floatIntensity={0.32}>
            <mesh position={[Math.cos(angle) * 10.1, 0.3 + (index % 2) * 0.55, Math.sin(angle) * 10.1]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.38, 2.15 + (index % 2) * 0.55, 0.38]} />
              <meshStandardMaterial color={station.theme.primary} emissive={station.theme.primary} emissiveIntensity={1.6} metalness={0.85} roughness={0.2} />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

function StationLandscape({ station }: Pick<NexusRoomProps, 'station'>) {
  if (station.id === 'neon') {
    return <group>
      {[-1, 1].map((side) => <group key={side} position={[side * 5.4, 0.15, -1.4]}>
        {[0, 1, 2].map((index) => <group key={index} position={[0, index * 1.55, index % 2 ? -0.5 : 0.3]}>
          <mesh><boxGeometry args={[1.7, 1.35, 1.3]} /><meshStandardMaterial color="#21104d" emissive="#f725d0" emissiveIntensity={0.35 + index * 0.16} metalness={0.9} roughness={0.18} /></mesh>
          {[-0.48, 0, 0.48].map((windowX) => <mesh key={windowX} position={[windowX, 0, 0.66]}><boxGeometry args={[0.22, 0.45, 0.025]} /><meshBasicMaterial color={index % 2 ? '#28d8ff' : '#ff5ce1'} /></mesh>)}
        </group>)}
      </group>)}
      <mesh position={[0, -1.25, 2.4]}><boxGeometry args={[3.8, 0.08, 7.2]} /><meshStandardMaterial color="#0c1432" emissive="#28d8ff" emissiveIntensity={0.5} metalness={0.85} /></mesh>
      {[-1, 0, 1].map((x) => <mesh key={x} position={[x * 0.85, -1.17, 3.3]}><boxGeometry args={[0.36, 0.02, 1.1]} /><meshBasicMaterial color="#f725d0" /></mesh>)}
      {[-1, 1].map((side) => <group key={`lamp-${side}`} position={[side * 2.35, -0.35, 2.1]}>
        <mesh><cylinderGeometry args={[0.055, 0.08, 1.8, 10]} /><meshStandardMaterial color="#2a2256" metalness={0.9} /></mesh>
        <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.18, 16, 12]} /><meshBasicMaterial color="#28d8ff" /></mesh>
        <pointLight position={[0, 0.95, 0]} color="#28d8ff" intensity={2.8} distance={3.5} />
      </group>)}
      <Float speed={1.6} floatIntensity={0.35}><group position={[0, 2.7, -2.9]}>
        <mesh><boxGeometry args={[3.1, 0.7, 0.08]} /><meshBasicMaterial color="#281560" transparent opacity={0.82} /></mesh>
        <Text position={[0, 0, 0.08]} fontSize={0.24} color="#74f4ff" anchorX="center">NEXUS // NEON DISTRICT</Text>
      </group></Float>
    </group>
  }
  if (station.id === 'wind') {
    return <group>
      {[[-4.8, 1.8, -1], [4.8, 2.5, -1], [-3.5, 3.8, 2], [3.4, 4.4, 1.6]].map(([x, y, z], index) => <Float key={index} speed={0.8 + index * 0.12} floatIntensity={0.75} rotationIntensity={0.15}>
        <mesh position={[x, y, z]}><dodecahedronGeometry args={[0.75 + index * 0.1, 0]} /><meshStandardMaterial color="#8c5cff" emissive="#66ffd8" emissiveIntensity={1.35} metalness={0.68} roughness={0.22} /></mesh>
      </Float>)}
      {[0, 1, 2].map((index) => <mesh key={index} position={[0, 0.5 + index * 0.7, -2.4]} rotation={[Math.PI / 2.8, index, 0]}><torusGeometry args={[2.25 + index * 0.5, 0.055, 12, 72]} /><meshBasicMaterial color="#66ffd8" transparent opacity={0.68} /></mesh>)}
      {[-1, 1].map((side) => <Float key={`isle-${side}`} speed={0.7} floatIntensity={0.36} rotationIntensity={0.08}>
        <group position={[side * 5.2, 0.2, 1.7]}>
          <mesh rotation={[0, Math.PI / 4, 0]}><cylinderGeometry args={[1.45, 0.75, 0.45, 6]} /><meshStandardMaterial color="#233a61" emissive="#384a83" emissiveIntensity={0.38} metalness={0.7} roughness={0.3} /></mesh>
          <mesh position={[0, 0.65, 0]}><coneGeometry args={[0.32, 1.5, 5]} /><meshStandardMaterial color="#9d8cff" emissive="#66ffd8" emissiveIntensity={0.85} /></mesh>
          <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.8, 0.04, 10, 48]} /><meshBasicMaterial color="#a9ffe9" /></mesh>
        </group>
      </Float>)}
    </group>
  }
  return <group>
    {[-1, 1].map((side) => <group key={side} position={[side * 4.9, -0.2, -1.5]} rotation={[0, 0, side * 0.18]}>
      <mesh><boxGeometry args={[1.15, 4.5, 1.15]} /><meshStandardMaterial color="#432a32" emissive="#ff8a3d" emissiveIntensity={0.85} metalness={0.95} roughness={0.24} /></mesh>
      <mesh position={[0, 2.45, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.28, 0.28, 3.4, 12]} /><meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={1.25} metalness={0.9} roughness={0.18} /></mesh>
    </group>)}
    <mesh position={[0, -0.8, -3.5]}><boxGeometry args={[5.6, 0.8, 1.2]} /><meshStandardMaterial color="#242438" metalness={0.95} roughness={0.23} /></mesh>
    {[0, 1, 2, 3].map((index) => <mesh key={index} position={[-2.4 + index * 1.6, -0.22, -2.85]}><boxGeometry args={[0.95, 0.48, 0.14]} /><meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={1.4} /></mesh>)}
    {[-1, 1].map((side) => <group key={`drone-${side}`} position={[side * 3.3, 2.3, 2.1]} rotation={[0, side * 0.5, 0]}>
      <mesh><sphereGeometry args={[0.52, 18, 14]} /><meshStandardMaterial color="#344158" emissive="#ff8a3d" emissiveIntensity={0.52} metalness={0.96} roughness={0.18} /></mesh>
      <mesh position={[0, 0, 0.48]}><circleGeometry args={[0.16, 20]} /><meshBasicMaterial color="#ffe066" /></mesh>
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.58, 0.045, 8, 36]} /><meshBasicMaterial color="#ffb15a" /></mesh>
    </group>)}
    <group position={[0, 1.35, -4.1]}>
      <mesh><boxGeometry args={[3.2, 1.25, 0.18]} /><meshStandardMaterial color="#172033" emissive="#202c43" emissiveIntensity={0.5} metalness={0.94} /></mesh>
      <Text position={[0, 0.22, 0.11]} fontSize={0.22} color="#ffe066" anchorX="center">HANGAR // MATERIAL LAB</Text>
      <Text position={[0, -0.22, 0.11]} fontSize={0.12} color="#ff9a4d" anchorX="center">METALNESS · ROUGHNESS · ESCALA</Text>
    </group>
  </group>
}

export function NexusRoom({ station, onReturn, missionState, onMissionAnswer, onActivateRelic }: NexusRoomProps) {
  const missionActive = missionState?.phase === 'active'
  const missionReady = missionState ? isMissionReady(missionState) : false
  const inVoid = missionState?.phase === 'void'
  return (
    <group>
      <RoomNavigator station={station} missionActive={missionActive} missionReady={missionReady} celebrating={missionState?.phase === 'success'} onMissionAnswer={onMissionAnswer} onActivateRelic={onActivateRelic} onReturn={onReturn} />
      <color attach="background" args={['#070512']} />
      <fog attach="fog" args={['#070512', 28, 75]} />
      <hemisphereLight args={['#bdc9ff', '#09020f', 1.05]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 7, 5]} intensity={2.35} color="#dcd5ff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-far={30} />
      <pointLight position={[0, 2, 0]} color={station.theme.primary} intensity={20} distance={14} />
      <pointLight position={[-4, 1, -3]} color={station.theme.secondary} intensity={12} distance={9} />
      <Sparkles count={320} scale={[35, 10, 35]} size={2.1} speed={0.35} color={station.theme.secondary} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]} receiveShadow>
        <circleGeometry args={[28, 144]} />
        <meshPhysicalMaterial color="#10092b" metalness={0.78} roughness={0.27} clearcoat={0.26} clearcoatRoughness={0.28} />
      </mesh>
      <ContactShadows position={[0, -1.4, 0]} opacity={0.48} scale={20} blur={2.2} far={8} color="#09020f" />
      {[6.1, 8.7, 10.8].map((radius, index) => <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.38 + index * 0.01, 0]}>
        <torusGeometry args={[radius, 0.025, 10, 112]} />
        <meshBasicMaterial color={station.theme.secondary} transparent opacity={0.18 + index * 0.08} />
      </mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.36, 0]}>
        <torusGeometry args={[3.1, 0.09, 16, 96]} />
        <meshStandardMaterial color={station.theme.secondary} emissive={station.theme.secondary} emissiveIntensity={2.4} metalness={0.95} roughness={0.16} />
      </mesh>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.45}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <icosahedronGeometry args={[1.25, 2]} />
          <meshStandardMaterial color={station.theme.primary} emissive={station.theme.primary} emissiveIntensity={1.5} metalness={0.7} roughness={0.17} />
        </mesh>
      </Float>
      <RoomArchitecture station={station} />
      <group position={[0, 1.015, 0]} scale={1.7}><StationLandscape station={station} /></group>
      <group position={[0, 0.5075, 0]} scale={1.35}><WorldScenery station={station} /></group>
      {missionActive && <MissionRelics station={station} activatedRelicIds={missionState?.activatedRelicIds ?? []} onActivateRelic={onActivateRelic} />}
      {missionReady && <MissionCourse station={station} />}
      {missionReady && <group position={[0, -0.32, 2.65]}>
        {station.room.challenge.options.map((option, index) => <MissionGate key={option} station={station} option={option} index={index} onAnswer={onMissionAnswer} />)}
        <Text position={[0, 2.7, 0]} maxWidth={6.2} fontSize={0.23} color="#ffffff" anchorX="center" textAlign="center">{station.room.challenge.question}</Text>
        <Text position={[0, -1.05, 0]} fontSize={0.16} color="#ffb1d9" anchorX="center">SALTA SOBRE UNA RUTA O PRESIONA E · CLIC TAMBIÉN DISPONIBLE · 2 FALLAS = GRIETA</Text>
      </group>}
      {missionActive && !missionReady && <Text position={[0, 1.78, 1.7]} fontSize={0.2} color={station.theme.secondary} anchorX="center">ACTIVA LOS 3 FRAGMENTOS DE RESONANCIA PARA MATERIALIZAR LAS COMPUERTAS</Text>}
      {missionState?.phase === 'success' && missionState.reward && <RewardPulse name={missionState.reward.name} icon={missionState.reward.icon} />}
      {inVoid && <VoidRift />}
      <group position={[0, -0.1, 8]} onClick={(event) => { event.stopPropagation(); onReturn() }}>
        <mesh>
          <torusGeometry args={[0.9, 0.13, 16, 72]} />
          <meshStandardMaterial color="#8defff" emissive="#3d8cff" emissiveIntensity={2.8} metalness={0.9} roughness={0.12} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.82, 64]} />
          <meshBasicMaterial color="#304fff" transparent opacity={0.34} />
        </mesh>
        <pointLight color="#65dcff" intensity={11} distance={5} />
        <Text position={[0, 1.5, 0]} fontSize={0.25} color="#c8f8ff" anchorX="center">REGRESAR AL NEXUS</Text>
        <Text position={[0, 1.18, 0]} fontSize={0.14} color="#ffffff" anchorX="center">ATRAVIESA EL PORTAL</Text>
      </group>
      <Text position={[0, 3.35, 0]} fontSize={0.44} color="#f7f2ff" anchorX="center">
        {`SALA · ${station.name.toUpperCase()}`}
      </Text>
    </group>
  )
}
