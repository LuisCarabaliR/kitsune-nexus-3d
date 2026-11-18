import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { movementFromKeys } from './roomMovement'

export function NexusExplorer() {
  const explorer = useRef<Group>(null)
  const pressedKeys = useRef(new Set<string>())

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => pressedKeys.current.add(event.code)
    const onKeyUp = (event: KeyboardEvent) => pressedKeys.current.delete(event.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!explorer.current) return
    const [x, , z] = movementFromKeys(pressedKeys.current)
    if (x || z) {
      const speed = 2.4 * delta
      explorer.current.position.x = Math.max(-7.4, Math.min(7.4, explorer.current.position.x + x * speed))
      explorer.current.position.z = Math.max(-7.4, Math.min(7.4, explorer.current.position.z + z * speed))
      explorer.current.rotation.y = Math.atan2(x, z)
    }
  })

  return (
    <group ref={explorer} position={[0, -0.7, 4.8]}>
      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.12}>
        <mesh castShadow position={[0, 0.88, 0]}>
          <capsuleGeometry args={[0.34, 0.72, 8, 16]} />
          <meshStandardMaterial color="#e6d7ff" metalness={0.35} roughness={0.38} />
        </mesh>
        <mesh castShadow position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.36, 24, 24]} />
          <meshStandardMaterial color="#2e1a58" metalness={0.58} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.69, 0.31]}>
          <boxGeometry args={[0.42, 0.14, 0.05]} />
          <meshStandardMaterial color="#7cecff" emissive="#30cbff" emissiveIntensity={2.4} metalness={0.75} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.55, 40]} />
          <meshBasicMaterial color="#b486ff" transparent opacity={0.7} />
        </mesh>
      </Float>
    </group>
  )
}
