import { Float, Sparkles, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { Station } from '../data/stations'
import { movementFromKeys } from './roomMovement'

type NexusRoomProps = {
  station: Station
  onReturn: () => void
}

function RoomNavigator() {
  const pressedKeys = useRef(new Set<string>())
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 1.8, 9)
    const onKeyDown = (event: KeyboardEvent) => pressedKeys.current.add(event.code)
    const onKeyUp = (event: KeyboardEvent) => pressedKeys.current.delete(event.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [camera])

  useFrame((_, delta) => {
    const [x, , z] = movementFromKeys(pressedKeys.current)
    if (!x && !z) return
    const speed = 2.6 * delta
    camera.position.x = Math.max(-6.8, Math.min(6.8, camera.position.x + x * speed))
    camera.position.z = Math.max(-6.8, Math.min(10, camera.position.z + z * speed))
  })

  return null
}

function RoomArchitecture({ station }: Pick<NexusRoomProps, 'station'>) {
  const orbit = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (orbit.current) orbit.current.rotation.y = clock.elapsedTime * 0.18
  })

  return (
    <group ref={orbit}>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2
        return (
          <Float key={index} speed={1.1 + index * 0.05} rotationIntensity={0.18} floatIntensity={0.32}>
            <mesh position={[Math.cos(angle) * 4.2, 0.3 + (index % 2) * 0.55, Math.sin(angle) * 4.2]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.58, 2.8 + (index % 2) * 0.8, 0.58]} />
              <meshStandardMaterial color={station.theme.primary} emissive={station.theme.primary} emissiveIntensity={1.6} metalness={0.85} roughness={0.2} />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

export function NexusRoom({ station, onReturn }: NexusRoomProps) {
  return (
    <group>
      <RoomNavigator />
      <color attach="background" args={['#070512']} />
      <fog attach="fog" args={['#070512', 7, 19]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 7, 5]} intensity={2.8} color="#dcd5ff" castShadow />
      <pointLight position={[0, 2, 0]} color={station.theme.primary} intensity={28} distance={12} />
      <pointLight position={[-4, 1, -3]} color={station.theme.secondary} intensity={12} distance={9} />
      <Sparkles count={240} scale={[15, 8, 15]} size={2.1} speed={0.35} color={station.theme.secondary} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]} receiveShadow>
        <circleGeometry args={[8.5, 96]} />
        <meshStandardMaterial color="#10092b" metalness={0.88} roughness={0.3} />
      </mesh>
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
      <group position={[0, -0.1, -5.2]} onClick={(event) => { event.stopPropagation(); onReturn() }}>
        <mesh>
          <torusGeometry args={[0.9, 0.13, 16, 72]} />
          <meshStandardMaterial color="#8defff" emissive="#3d8cff" emissiveIntensity={2.8} metalness={0.9} roughness={0.12} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.82, 64]} />
          <meshBasicMaterial color="#304fff" transparent opacity={0.34} />
        </mesh>
        <pointLight color="#65dcff" intensity={11} distance={5} />
        <Text position={[0, 1.25, 0]} fontSize={0.18} color="#c8f8ff" anchorX="center">PORTAL DE REGRESO</Text>
      </group>
      <Text position={[0, 3.35, 0]} fontSize={0.44} color="#f7f2ff" anchorX="center">
        {`SALA · ${station.name.toUpperCase()}`}
      </Text>
    </group>
  )
}
