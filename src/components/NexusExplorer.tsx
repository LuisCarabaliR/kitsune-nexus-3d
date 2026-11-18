import { Float, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { advanceJump, explorerWalkSwing, moveExplorer, movementFromKeys } from './roomMovement'

type NexusExplorerProps = {
  onMove?: (position: [number, number, number]) => void
}

export function NexusExplorer({ onMove }: NexusExplorerProps) {
  const explorer = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)
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

  useFrame(({ clock }, delta) => {
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
      onMove?.(next)
    }
    const swing = explorerWalkSwing(clock.elapsedTime, Boolean(x || z))
    if (leftArm.current) leftArm.current.rotation.x = swing
    if (rightArm.current) rightArm.current.rotation.x = -swing
    if (leftLeg.current) leftLeg.current.rotation.x = -swing
    if (rightLeg.current) rightLeg.current.rotation.x = swing
  })

  return (
    <group ref={explorer} position={[0, -0.7, 4.8]} scale={1.08}>
      <Float speed={1.45} rotationIntensity={0.06} floatIntensity={0.1}>
        <group>
          <mesh castShadow position={[0, 1.01, 0]} scale={[0.9, 1.08, 0.72]}>
            <capsuleGeometry args={[0.39, 0.7, 8, 16]} />
            <meshStandardMaterial color="#313c87" metalness={0.68} roughness={0.25} />
          </mesh>
          <mesh castShadow position={[0, 1.76, 0.03]} scale={[0.9, 1.06, 0.88]}>
            <sphereGeometry args={[0.35, 28, 28]} />
            <meshStandardMaterial color="#f0b995" metalness={0.05} roughness={0.5} />
          </mesh>
          <group position={[0, 1.86, -0.08]}>
            <mesh position={[0, 0.12, -0.17]} scale={[1.12, 1.02, 1.1]}>
              <sphereGeometry args={[0.38, 28, 28]} />
              <meshStandardMaterial color="#20143c" metalness={0.5} roughness={0.25} />
            </mesh>
            <mesh position={[-0.25, -0.17, -0.2]} rotation={[0, 0, 0.34]}>
              <capsuleGeometry args={[0.08, 0.5, 6, 12]} />
              <meshStandardMaterial color="#b75cff" emissive="#55238d" emissiveIntensity={0.7} />
            </mesh>
            <mesh position={[0.26, -0.22, -0.2]} rotation={[0, 0, -0.25]}>
              <capsuleGeometry args={[0.08, 0.58, 6, 12]} />
              <meshStandardMaterial color="#b75cff" emissive="#55238d" emissiveIntensity={0.7} />
            </mesh>
            <mesh position={[0, 0.32, -0.34]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.19, 0.48, 12]} /><meshStandardMaterial color="#d387ff" emissive="#6e3ed3" emissiveIntensity={0.65} /></mesh>
          </group>
          <mesh position={[0, 1.77, 0.33]} scale={[1.08, 1, 1]}>
            <boxGeometry args={[0.43, 0.12, 0.05]} />
            <meshStandardMaterial color="#7cecff" emissive="#30cbff" emissiveIntensity={3.1} metalness={0.82} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.08, 0.4]}>
            <boxGeometry args={[0.48, 0.24, 0.06]} />
            <meshStandardMaterial color="#ce8fff" emissive="#7041dd" emissiveIntensity={1.4} metalness={0.72} roughness={0.18} />
          </mesh>
          <group ref={leftArm} position={[-0.4, 1.2, 0]}>
            <mesh position={[0, -0.27, 0]} rotation={[0, 0, 0.15]}><capsuleGeometry args={[0.11, 0.42, 6, 12]} /><meshStandardMaterial color="#4f5dba" metalness={0.62} roughness={0.3} /></mesh>
            <mesh position={[0, -0.55, 0]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#f0b995" /></mesh>
          </group>
          <group ref={rightArm} position={[0.4, 1.2, 0]}>
            <mesh position={[0, -0.27, 0]} rotation={[0, 0, -0.15]}><capsuleGeometry args={[0.11, 0.42, 6, 12]} /><meshStandardMaterial color="#4f5dba" metalness={0.62} roughness={0.3} /></mesh>
            <mesh position={[0, -0.55, 0]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#f0b995" /></mesh>
          </group>
          <group ref={leftLeg} position={[-0.17, 0.56, 0]}>
            <mesh position={[0, -0.32, 0]}><capsuleGeometry args={[0.13, 0.52, 6, 12]} /><meshStandardMaterial color="#20223e" metalness={0.42} roughness={0.4} /></mesh>
            <mesh position={[0, -0.67, 0.07]} scale={[1, 0.65, 1.25]}><sphereGeometry args={[0.16, 12, 12]} /><meshStandardMaterial color="#7cecff" emissive="#1b86d8" emissiveIntensity={1.2} /></mesh>
          </group>
          <group ref={rightLeg} position={[0.17, 0.56, 0]}>
            <mesh position={[0, -0.32, 0]}><capsuleGeometry args={[0.13, 0.52, 6, 12]} /><meshStandardMaterial color="#20223e" metalness={0.42} roughness={0.4} /></mesh>
            <mesh position={[0, -0.67, 0.07]} scale={[1, 0.65, 1.25]}><sphereGeometry args={[0.16, 12, 12]} /><meshStandardMaterial color="#7cecff" emissive="#1b86d8" emissiveIntensity={1.2} /></mesh>
          </group>
          <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.52, 0.6, 40]} /><meshBasicMaterial color="#b486ff" transparent opacity={0.75} /></mesh>
          <mesh position={[0, 1.26, 0.32]} rotation={[0, 0, Math.PI / 4]}><octahedronGeometry args={[0.11, 0]} /><meshStandardMaterial color="#7cecff" emissive="#38ccff" emissiveIntensity={2.5} /></mesh>
          <Text position={[0, 2.35, 0]} fontSize={0.13} color="#d8faff" anchorX="center">LUMI · EXPLORADORA</Text>
        </group>
      </Float>
    </group>
  )
}
