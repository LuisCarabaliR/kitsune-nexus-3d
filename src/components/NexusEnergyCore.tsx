import { Float, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import type { Station } from '../data/stations'

type NexusEnergyCoreProps = {
  station: Station
  active: boolean
  position: [number, number, number]
  onActivate: (id: Station['id']) => void
}

export function NexusEnergyCore({ station, active, position, onActivate }: NexusEnergyCoreProps) {
  const core = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!core.current) return
    core.current.rotation.y = clock.elapsedTime * (active ? 0.85 : 0.35)
    core.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.6 + position[0]) * (active ? 0.15 : 0.06)
  })

  const color = active ? station.theme.secondary : station.theme.primary

  return (
    <group ref={core} position={position}>
      <Float speed={active ? 2.2 : 1} rotationIntensity={0.22} floatIntensity={active ? 0.5 : 0.18}>
        <mesh
          castShadow
          onClick={(event) => {
            event.stopPropagation()
            if (!active) onActivate(station.id)
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <octahedronGeometry args={[0.52, 1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 3 : hovered ? 2.1 : 1.1} metalness={0.65} roughness={0.14} />
        </mesh>
        {[0, Math.PI / 2].map((rotation) => (
          <mesh key={rotation} rotation={[rotation, 0, Math.PI / 2]}>
            <torusGeometry args={[0.82, 0.035, 12, 56]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.5} />
          </mesh>
        ))}
      </Float>
      <pointLight color={color} intensity={active ? 28 : 9} distance={5.5} />
      <Text position={[0, -1.05, 0]} fontSize={0.17} color={active ? '#eaffff' : '#b9aacd'} anchorX="center">
        {active ? `${station.name} · ACTIVO` : `ACTIVAR · ${station.name}`}
      </Text>
    </group>
  )
}
