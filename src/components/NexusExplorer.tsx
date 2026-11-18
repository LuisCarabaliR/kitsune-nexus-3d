import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { advanceJump, moveExplorer, movementFromKeys } from './roomMovement'

export function NexusExplorer() {
  const explorer = useRef<Group>(null)
  const pressedKeys = useRef(new Set<string>())
  const jumpQueued = useRef(false)
  const jump = useRef({ height: 0, velocity: 0 })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) jumpQueued.current = true
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
  }, [])

  useFrame((_, delta) => {
    if (!explorer.current) return
    jump.current = advanceJump(jump.current, jumpQueued.current, delta)
    jumpQueued.current = false
    explorer.current.position.y = -0.7 + jump.current.height
    const [x, , z] = movementFromKeys(pressedKeys.current)
    if (x || z) {
      const speed = 2.4 * delta
      const next = moveExplorer([explorer.current.position.x, 0, explorer.current.position.z], [x, 0, z], speed)
      explorer.current.position.x = next[0]
      explorer.current.position.z = next[2]
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
