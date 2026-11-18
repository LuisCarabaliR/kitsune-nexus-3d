import { Float, Text, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { advanceJump, moveExplorer, movementFromKeys } from './roomMovement'
import lumiExplorer from '../assets/lumi-explorer-v1.png'

type NexusExplorerProps = {
  onMove?: (position: [number, number, number]) => void
}

export function NexusExplorer({ onMove }: NexusExplorerProps) {
  const explorer = useRef<Group>(null)
  const avatarTexture = useTexture(lumiExplorer)
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
  })

  return (
    <group ref={explorer} position={[0, -0.7, 4.8]} scale={1.08}>
      <Float speed={1.45} rotationIntensity={0.06} floatIntensity={0.1}>
        <group position={[0, 1.15, 0]}>
          <sprite scale={[2.25, 3.4, 1]}>
            <spriteMaterial map={avatarTexture} transparent depthWrite={false} />
          </sprite>
          <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.58, 0.67, 40]} /><meshBasicMaterial color="#b486ff" transparent opacity={0.78} /></mesh>
          <pointLight position={[0, 0.35, 0.25]} color="#7cecff" intensity={2.5} distance={3.5} />
          <Text position={[0, 2.15, 0]} fontSize={0.13} color="#d8faff" anchorX="center">LUMI · EXPLORADORA</Text>
        </group>
      </Float>
    </group>
  )
}
