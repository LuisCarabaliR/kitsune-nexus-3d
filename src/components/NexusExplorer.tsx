import { Text } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Group } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { advanceJump, explorerWalkSwing, moveExplorer, movementFromKeys } from './roomMovement'

type NexusExplorerProps = {
  onMove?: (position: [number, number, number]) => void
}

const avatarUrl = `${import.meta.env.BASE_URL}assets/lumi-avatar.vrm`

export function VrmLumi({ moving }: { moving: MutableRefObject<boolean> }) {
  const gltf = useLoader(GLTFLoader, avatarUrl, (loader) => loader.register((parser) => new VRMLoaderPlugin(parser)))
  const vrm = gltf.userData.vrm as VRM | undefined

  useEffect(() => {
    if (vrm) VRMUtils.rotateVRM0(vrm)
  }, [vrm])

  useFrame(({ clock }, delta) => {
    if (!vrm) return
    vrm.update(delta)
    const swing = explorerWalkSwing(clock.elapsedTime, moving.current)
    const leftArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm')
    const rightArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm')
    const leftForeArm = vrm.humanoid?.getNormalizedBoneNode('leftLowerArm')
    const rightForeArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm')
    const leftLeg = vrm.humanoid?.getNormalizedBoneNode('leftUpperLeg')
    const rightLeg = vrm.humanoid?.getNormalizedBoneNode('rightUpperLeg')
    if (leftArm) { leftArm.rotation.z = 1.05; leftArm.rotation.x = swing * 0.42 }
    if (rightArm) { rightArm.rotation.z = -1.05; rightArm.rotation.x = -swing * 0.42 }
    if (leftForeArm) leftForeArm.rotation.z = 0.14
    if (rightForeArm) rightForeArm.rotation.z = -0.14
    if (leftLeg) leftLeg.rotation.x = -swing * 0.36
    if (rightLeg) rightLeg.rotation.x = swing * 0.36
    vrm.expressionManager?.setValue('blink', Math.max(0, Math.sin(clock.elapsedTime * 2.1) - 0.94) * 16)
  })

  if (!vrm) return null
  return <primitive object={vrm.scene} position={[0, -1.38, 0]} rotation={[0, Math.PI, 0]} scale={1.28} />
}

export function NexusExplorer({ onMove }: NexusExplorerProps) {
  const explorer = useRef<Group>(null)
  const moving = useRef(false)
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
    moving.current = Boolean(x || z)
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
      <group position={[0, 0.55, 0]}>
        <VrmLumi moving={moving} />
        <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.58, 0.67, 40]} /><meshBasicMaterial color="#b486ff" transparent opacity={0.78} /></mesh>
        <pointLight position={[0, 0.35, 0.25]} color="#7cecff" intensity={2.5} distance={3.5} />
        <Text position={[0, 1.9, 0]} fontSize={0.13} color="#d8faff" anchorX="center">LUMI · EXPLORADORA</Text>
      </group>
    </group>
  )
}
