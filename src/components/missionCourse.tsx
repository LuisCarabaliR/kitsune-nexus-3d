import { Float, Text } from '@react-three/drei'
import type { Station } from '../data/stations'
import { missionGatePositions } from './nexusExploration'

export function missionCoursePlatforms(): [number, number, number][] {
  return missionGatePositions.map(([x, , z]) => [x, -0.98, z + 0.92])
}

export function MissionCourse({ station }: { station: Station }) {
  return <group>
    {missionCoursePlatforms().map(([x, y, z], index) => <Float key={index} speed={1.05 + index * 0.14} floatIntensity={0.11} rotationIntensity={0.08}>
      <group position={[x, y, z]}>
        <mesh castShadow receiveShadow><boxGeometry args={[1.7, 0.22, 1.45]} /><meshStandardMaterial color="#18214c" emissive={station.theme.primary} emissiveIntensity={0.78} metalness={0.9} roughness={0.18} /></mesh>
        <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.52, 0.038, 10, 40]} /><meshBasicMaterial color={station.theme.secondary} /></mesh>
        <pointLight position={[0, 0.55, 0]} color={station.theme.secondary} intensity={3.2} distance={3.4} />
        <Text position={[0, 0.37, 0.65]} fontSize={0.12} color="#ffffff" anchorX="center">RUTA {index + 1}</Text>
      </group>
    </Float>)}
    {missionCoursePlatforms().map(([x, , z], index) => <mesh key={`trail-${index}`} position={[x, -1.1, z + 0.88]}>
      <boxGeometry args={[0.32, 0.035, 1.55]} />
      <meshBasicMaterial color={station.theme.secondary} transparent opacity={0.65} />
    </mesh>)}
  </group>
}
