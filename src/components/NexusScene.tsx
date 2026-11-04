import { OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { stations, type Station } from '../data/stations'
import { NexusPortal } from './NexusPortal'

type NexusSceneProps = {
  onSelect: (id: Station['id']) => void
}

export function NexusScene({ onSelect }: NexusSceneProps) {
  return (
    <div className="nexus-canvas" role="img" aria-label="Escena 3D del Nexus Central con tres portales explorables">
      <Canvas camera={{ position: [0, 3, 10], fov: 48 }} shadows dpr={[1, 1.75]}>
        <color attach="background" args={['#08051a']} />
        <fog attach="fog" args={['#08051a', 7, 18]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 7, 4]} intensity={2.5} color="#b8d9ff" castShadow />
        <pointLight position={[0, 2, 1]} intensity={20} color="#995cff" distance={9} />
        <Stars radius={60} depth={30} count={1200} factor={2.5} saturation={0.6} fade speed={0.7} />
        <Sparkles count={180} scale={[14, 7, 6]} size={2.3} speed={0.25} color="#7cecff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
          <circleGeometry args={[7, 96]} />
          <meshStandardMaterial color="#120b34" metalness={0.8} roughness={0.34} />
        </mesh>
        <mesh position={[0, -1.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.3, 0.06, 12, 96]} />
          <meshStandardMaterial color="#8458ff" emissive="#5939cf" emissiveIntensity={2} metalness={0.85} />
        </mesh>
        {stations.map((station) => (
          <NexusPortal key={station.id} station={station} onSelect={onSelect} />
        ))}
        <OrbitControls enablePan={false} minDistance={6} maxDistance={14} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  )
}
