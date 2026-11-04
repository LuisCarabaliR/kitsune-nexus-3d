import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import type { Station } from '../data/stations'

type NexusPortalProps = {
  station: Station
  onSelect: (id: Station['id']) => void
}

export function NexusPortal({ station, onSelect }: NexusPortalProps) {
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
          onSelect(station.id)
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <torusGeometry args={[1.05, 0.15, 24, 96]} />
        <meshStandardMaterial
          color={station.theme.primary}
          emissive={station.theme.primary}
          emissiveIntensity={hovered ? 3 : 1.7}
          metalness={0.74}
          roughness={0.18}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 64]} />
        <meshBasicMaterial color={station.theme.secondary} transparent opacity={hovered ? 0.62 : 0.32} />
      </mesh>
      <pointLight color={station.theme.primary} intensity={hovered ? 24 : 12} distance={5} />
      <Text position={[0, -1.5, 0]} fontSize={0.24} color="#f5f1ff" anchorX="center">
        {station.name}
      </Text>
    </group>
  )
}
