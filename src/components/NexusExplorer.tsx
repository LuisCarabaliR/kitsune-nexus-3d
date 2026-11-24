import { Text } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Group } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { advanceJump, explorerWalkSwing, moveExplorer, movementFromKeys, smoothTurn, smoothVelocity } from './roomMovement'

type NexusExplorerProps = {
  onMove?: (position: [number, number, number]) => void
}

const avatarUrl = `${import.meta.env.BASE_URL}assets/lumi-hero.vrm`

export function VrmLumi({ moving, motion }: { moving: MutableRefObject<boolean>, motion?: MutableRefObject<number> }) {
  const gltf = useLoader(GLTFLoader, avatarUrl, (loader) => loader.register((parser) => new VRMLoaderPlugin(parser)))
  const vrm = gltf.userData.vrm as VRM | undefined
  const visual = useRef<Group>(null)

  useEffect(() => {
    if (vrm) VRMUtils.rotateVRM0(vrm)
  }, [vrm])

  useFrame(({ clock }, delta) => {
    if (!vrm) return
    vrm.update(delta)
    const intensity = motion?.current ?? (moving.current ? 1 : 0)
    const swing = explorerWalkSwing(clock.elapsedTime, moving.current) * intensity
    const leftArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm')
    const rightArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm')
    const leftForeArm = vrm.humanoid?.getNormalizedBoneNode('leftLowerArm')
    const rightForeArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm')
    const leftLeg = vrm.humanoid?.getNormalizedBoneNode('leftUpperLeg')
    const rightLeg = vrm.humanoid?.getNormalizedBoneNode('rightUpperLeg')
    if (leftArm) { leftArm.rotation.z = -0.88; leftArm.rotation.x = swing * 0.26 }
    if (rightArm) { rightArm.rotation.z = 0.88; rightArm.rotation.x = -swing * 0.26 }
    if (leftForeArm) leftForeArm.rotation.z = -0.08
    if (rightForeArm) rightForeArm.rotation.z = 0.08
    if (leftLeg) leftLeg.rotation.x = -swing * 0.28
    if (rightLeg) rightLeg.rotation.x = swing * 0.28
    if (visual.current) visual.current.position.y = -0.68 + Math.sin(clock.elapsedTime * (1.7 + intensity * 3.2)) * (0.008 + intensity * 0.017)
    vrm.expressionManager?.setValue('blink', Math.max(0, Math.sin(clock.elapsedTime * 2.1) - 0.94) * 16)
  })

  if (!vrm) return null
  return <group ref={visual} position={[0, -0.68, 0]} rotation={[0, Math.PI, 0]} scale={1.42}>
    <primitive object={vrm.scene} />
  </group>
}

export function NexusExplorer({ onMove }: NexusExplorerProps) {
  const explorer = useRef<Group>(null)
  const moving = useRef(false)
  const motion = useRef(0)
  const pressedKeys = useRef(new Set<string>())
  const jumpQueued = useRef(false)
  const jump = useRef({ height: 0, velocity: 0 })
  const velocity = useRef<[number, number, number]>([0, 0, 0])

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
    const direction = movementFromKeys(pressedKeys.current)
    velocity.current = smoothVelocity(velocity.current, direction, delta, 2.7)
    const [x, , z] = velocity.current
    moving.current = Math.hypot(x, z) > 0.15
    motion.current = Math.min(1, Math.hypot(x, z) / 2.7)
    if (moving.current) {
      const next = moveExplorer([explorer.current.position.x, 0, explorer.current.position.z], velocity.current, delta)
      explorer.current.position.x = next[0]
      explorer.current.position.z = next[2]
      if (direction[0] || direction[2]) explorer.current.rotation.y = smoothTurn(explorer.current.rotation.y, Math.atan2(direction[0], direction[2]), delta)
      onMove?.(next)
    }
  })

  return (
    <group ref={explorer} position={[0, -0.7, 4.8]} scale={1.08}>
      <group position={[0, 0.55, 0]}>
        <VrmLumi moving={moving} motion={motion} />
        <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.58, 0.67, 40]} /><meshBasicMaterial color="#b486ff" transparent opacity={0.78} /></mesh>
        <pointLight position={[0, 0.35, 0.25]} color="#7cecff" intensity={1.1} distance={3.5} />
        <Text position={[0, 1.9, 0]} fontSize={0.13} color="#d8faff" anchorX="center">LUMI · EXPLORADORA</Text>
      </group>
    </group>
  )
}
