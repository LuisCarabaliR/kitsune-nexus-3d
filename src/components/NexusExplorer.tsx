import { Float, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { advanceJump, explorerWalkSwing, moveExplorer, movementFromKeys } from './roomMovement'

export function NexusExplorer() {
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
          <mesh castShadow position={[0, 0.99, 0]}>
            <capsuleGeometry args={[0.36, 0.65, 8, 16]} />
            <meshStandardMaterial color="#26386d" metalness={0.68} roughness={0.28} />
          </mesh>
          <mesh castShadow position={[0, 1.73, 0.02]}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial color="#f0b995" metalness={0.05} roughness={0.5} />
          </mesh>
          <group position={[0, 1.82, -0.08]}>
            <mesh position={[0, 0.12, -0.17]} scale={[1.06, 0.95, 1.04]}>
              <sphereGeometry args={[0.38, 24, 24]} />
              <meshStandardMaterial color="#17132d" metalness={0.4} roughness={0.32} />
            </mesh>
            <mesh position={[-0.22, -0.19, -0.17]} rotation={[0, 0, 0.3]}>
              <capsuleGeometry args={[0.075, 0.43, 6, 12]} />
              <meshStandardMaterial color="#6d4ab8" emissive="#351863" emissiveIntensity={0.45} />
            </mesh>
            <mesh position={[0.24, -0.24, -0.16]} rotation={[0, 0, -0.22]}>
              <capsuleGeometry args={[0.075, 0.54, 6, 12]} />
              <meshStandardMaterial color="#6d4ab8" emissive="#351863" emissiveIntensity={0.45} />
            </mesh>
          </group>
          <mesh position={[0, 1.73, 0.32]}>
            <boxGeometry args={[0.43, 0.12, 0.05]} />
            <meshStandardMaterial color="#7cecff" emissive="#30cbff" emissiveIntensity={2.7} metalness={0.82} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.06, 0.38]}>
            <boxGeometry args={[0.44, 0.21, 0.055]} />
            <meshStandardMaterial color="#b687ff" emissive="#7041dd" emissiveIntensity={1.1} metalness={0.72} roughness={0.18} />
          </mesh>
          <group ref={leftArm} position={[-0.4, 1.2, 0]}>
            <mesh position={[0, -0.27, 0]} rotation={[0, 0, 0.15]}><capsuleGeometry args={[0.105, 0.42, 6, 12]} /><meshStandardMaterial color="#4459a7" metalness={0.62} roughness={0.3} /></mesh>
            <mesh position={[0, -0.55, 0]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#f0b995" /></mesh>
          </group>
          <group ref={rightArm} position={[0.4, 1.2, 0]}>
            <mesh position={[0, -0.27, 0]} rotation={[0, 0, -0.15]}><capsuleGeometry args={[0.105, 0.42, 6, 12]} /><meshStandardMaterial color="#4459a7" metalness={0.62} roughness={0.3} /></mesh>
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
          <Text position={[0, 2.35, 0]} fontSize={0.13} color="#d8faff" anchorX="center">LUMI · EXPLORADORA</Text>
        </group>
      </Float>
    </group>
  )
}
