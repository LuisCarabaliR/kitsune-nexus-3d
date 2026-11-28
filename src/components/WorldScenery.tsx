import { Float, Text } from '@react-three/drei'
import type { Station } from '../data/stations'

function City() {
  return <group>
    {Array.from({ length: 9 }, (_, i) => {
      const x = (i - 4) * 3.7
      const height = 4 + (i * 7 % 5) * 1.2
      return <group key={i} position={[x, -1.45, -14]}>
        <mesh position={[0, height / 2, 0]}><boxGeometry args={[2.5, height, 2.8]} /><meshStandardMaterial color="#111c39" metalness={0.7} roughness={0.42} /></mesh>
        {Array.from({ length: 4 }, (_, row) => <mesh key={row} position={[0, 1.1 + row * 0.8, 1.41]}><boxGeometry args={[1.85, 0.09, 0.025]} /><meshBasicMaterial color={i % 2 ? '#18dfff' : '#fa41d9'} /></mesh>)}
        <mesh position={[0, height + 0.28, 0]}><boxGeometry args={[0.1, 0.6, 0.1]} /><meshBasicMaterial color="#ff58d8" /></mesh>
      </group>
    })}
    {[-1, 1].map((side) => <group key={side} position={[side * 9.6, -1.15, 2]}>
      <mesh position={[0, 0.35, 0]}><boxGeometry args={[3.5, 0.7, 1.4]} /><meshStandardMaterial color="#1b2f4d" metalness={0.85} roughness={0.25} /></mesh>
      <mesh position={[0, 0.78, 0]}><boxGeometry args={[1.8, 0.45, 1.1]} /><meshStandardMaterial color="#4fdcff" emissive="#1449a0" metalness={0.8} roughness={0.12} /></mesh>
      {[-1, 1].map((wheel) => <mesh key={wheel} position={[wheel * 1.15, 0.12, 0.7]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.09, 10, 24]} /><meshBasicMaterial color="#ff3adc" /></mesh>)}
      <Text position={[0, 1.4, 0]} fontSize={0.2} color="#70efff" anchorX="center">AERO TAXI</Text>
    </group>)}
  </group>
}

function Sanctuary() {
  return <group>
    <mesh position={[0, 5.8, -16]}><sphereGeometry args={[3.2, 32, 24]} /><meshBasicMaterial color="#bdcbff" /></mesh>
    {[-1, 1].map((side) => <group key={side} position={[side * 9.5, -1.1, -8]}>
      <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.34, 0.45, 3.6, 12]} /><meshStandardMaterial color="#bdc6d0" roughness={0.8} /></mesh>
      <mesh position={[0, 3.75, 0]}><boxGeometry args={[1.15, 0.38, 1.15]} /><meshStandardMaterial color="#b2bfd3" roughness={0.7} /></mesh>
      <mesh position={[0, 4.1, 0]}><coneGeometry args={[0.72, 0.6, 4]} /><meshStandardMaterial color="#8f86b8" metalness={0.35} roughness={0.5} /></mesh>
      <Float speed={0.8} floatIntensity={0.4}><mesh position={[0, 5, 0]}><octahedronGeometry args={[0.42, 0]} /><meshStandardMaterial color="#85ffe3" emissive="#4dffcd" emissiveIntensity={1.5} /></mesh></Float>
    </group>)}
    {[-1, 1].map((side) => <group key={`tree-${side}`} position={[side * 10, -1.4, 5]}>
      <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.16, 0.27, 2.2, 9]} /><meshStandardMaterial color="#625366" roughness={0.9} /></mesh>
      {[[-0.45, 2.25, 0], [0.45, 2.45, 0], [0, 3, 0]].map(([x, y, z], i) => <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.78, 12, 10]} /><meshStandardMaterial color={i === 1 ? '#e8a8d4' : '#b68cd4'} roughness={0.8} /></mesh>)}
    </group>)}
  </group>
}

function Hangar() {
  return <group>
    {[-1, 1].map((side) => <group key={side} position={[side * 10, -1.3, -5]}>
      <mesh position={[0, 3.3, 0]}><boxGeometry args={[0.55, 6.6, 0.7]} /><meshStandardMaterial color="#45505b" metalness={0.9} roughness={0.38} /></mesh>
      <mesh position={[0, 6.6, 0]}><boxGeometry args={[1.1, 0.32, 1.2]} /><meshStandardMaterial color="#ffad45" emissive="#d65c0c" emissiveIntensity={1.2} /></mesh>
      <mesh position={[0, 0.55, 4]}><boxGeometry args={[2.3, 1.1, 1.6]} /><meshStandardMaterial color="#58626b" metalness={0.8} roughness={0.5} /></mesh>
      <mesh position={[0, 0.55, 4.81]}><boxGeometry args={[1.65, 0.14, 0.03]} /><meshBasicMaterial color="#ffc55c" /></mesh>
    </group>)}
    <group position={[0, 3.3, -13]}>
      <mesh><boxGeometry args={[5.2, 1.2, 1.8]} /><meshStandardMaterial color="#526172" metalness={0.9} roughness={0.3} /></mesh>
      <mesh position={[0, 0.55, -0.2]}><coneGeometry args={[1.1, 2.4, 5]} /><meshStandardMaterial color="#8796a8" metalness={0.85} roughness={0.25} /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 3.3, -0.3, 0]} rotation={[0, 0, side * 0.15]}><boxGeometry args={[2.5, 0.2, 2.7]} /><meshStandardMaterial color="#374a60" metalness={0.9} roughness={0.3} /></mesh>)}
      <Text position={[0, -1.4, 1]} fontSize={0.27} color="#ffc46b" anchorX="center">NAVE DE EXPLORACIÓN</Text>
    </group>
  </group>
}

export function WorldScenery({ station }: { station: Station }) {
  return station.id === 'neon' ? <City /> : station.id === 'wind' ? <Sanctuary /> : <Hangar />
}
