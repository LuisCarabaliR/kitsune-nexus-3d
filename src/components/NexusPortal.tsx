import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import type { Station } from '../data/stations'

type NexusPortalProps = {
  station: Station
  unlocked: boolean
  onSelect: (id: Station['id']) => void
}

export function NexusPortal({ station, unlocked, onSelect }: NexusPortalProps) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45 + station.theme.position[0]) * 0.13
    group.current.position.y = station.theme.position[1] + Math.sin(clock.elapsedTime + station.theme.position[0]) * 0.12
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
      <pointLight color={unlocked ? station.theme.primary : '#333047'} intensity={unlocked ? hovered ? 24 : 12 : 2} distance={5} />
      <Text position={[0, -1.5, 0]} fontSize={0.24} color="#f5f1ff" anchorX="center">
        {unlocked ? station.name : `${station.name} · BLOQUEADO`}
      </Text>
    </group>
  )
}
