import { Sparkles, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import type { Station } from '../data/stations'

type NexusPortalProps = {
  station: Station
  unlocked: boolean
  onSelect: (id: Station['id']) => void
}

export function vortexPulse(elapsedTime: number): number {
  return 1 + Math.sin(elapsedTime) * 0.12
}

export function NexusPortal({ station, unlocked, onSelect }: NexusPortalProps) {
  const group = useRef<Group>(null)
  const vortex = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45 + station.theme.position[0]) * 0.13
    group.current.position.y = station.theme.position[1] + Math.sin(clock.elapsedTime + station.theme.position[0]) * 0.12
    if (vortex.current) {
      vortex.current.rotation.z = clock.elapsedTime * 1.15
      vortex.current.scale.setScalar(vortexPulse(clock.elapsedTime + station.theme.position[0]))
    }
  })

  return (
    <group ref={group} position={station.theme.position}>
      <mesh
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation()
          if (unlocked) onSelect(station.id)
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <torusGeometry args={[1.05, 0.15, 24, 96]} />
        <meshStandardMaterial
          color={unlocked ? station.theme.primary : '#4a4562'}
          emissive={unlocked ? station.theme.primary : '#1d1b2c'}
          emissiveIntensity={unlocked ? hovered ? 3 : 1.7 : 0.45}
          metalness={0.74}
          roughness={0.18}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 64]} />
        <meshBasicMaterial color={unlocked ? station.theme.secondary : '#151322'} transparent opacity={unlocked ? hovered ? 0.62 : 0.32 : 0.24} />
      </mesh>
      <group ref={vortex} rotation={[0, 0, 0]}>
        {[0, Math.PI / 2].map((rotation) => <mesh key={`orbit-${rotation}`} rotation={[Math.PI / 2, rotation, 0]}>
          <torusGeometry args={[0.88, 0.022, 10, 56]} />
          <meshBasicMaterial color={station.theme.secondary} transparent opacity={0.62} />
        </mesh>)}
        {[0, Math.PI / 3, (Math.PI * 2) / 3].map((rotation) => <mesh key={rotation} rotation={[Math.PI / 2, 0, rotation]}>
          <torusGeometry args={[0.58, 0.045, 10, 48, Math.PI * 1.45]} />
          <meshBasicMaterial color={station.theme.primary} transparent opacity={0.82} />
        </mesh>)}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.78, 64]} />
          <meshBasicMaterial color={station.theme.secondary} transparent opacity={0.28} />
        </mesh>
      </group>
      {[-1, 1].map((side) => <group key={side} position={[side * 1.35, 0.18, 0]} rotation={[0, 0, side * -0.16]}>
        <mesh><cylinderGeometry args={[0.11, 0.18, 2.15, 10]} /><meshStandardMaterial color="#20204c" emissive={station.theme.primary} emissiveIntensity={0.72} metalness={0.88} roughness={0.18} /></mesh>
        <mesh position={[0, 1.18, 0]}><octahedronGeometry args={[0.19, 0]} /><meshStandardMaterial color={station.theme.secondary} emissive={station.theme.secondary} emissiveIntensity={1.8} /></mesh>
      </group>)}
      <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.15, 1.48, 64]} /><meshBasicMaterial color={station.theme.primary} transparent opacity={0.42} /></mesh>
      <Sparkles count={36} scale={[1.9, 1.9, 0.3]} size={2.4} speed={0.8} color={station.theme.secondary} />
      <pointLight color={unlocked ? station.theme.primary : '#333047'} intensity={unlocked ? hovered ? 24 : 12 : 2} distance={5} />
      <Text position={[0, -1.5, 0]} fontSize={0.24} color="#f5f1ff" anchorX="center">
        {unlocked ? station.name : `${station.name} · BLOQUEADO`}
      </Text>
    </group>
  )
}
