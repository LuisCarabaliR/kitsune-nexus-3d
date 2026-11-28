import { Text } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef, type MutableRefObject } from 'react'
import { AnimationMixer, LoopOnce, LoopRepeat, type AnimationAction, type Group } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation'
import { advanceJump, moveExplorer, movementFromKeys, smoothTurn, smoothVelocity } from './roomMovement'
import { needsVrm0Rotation } from './vrmOrientation'
import { selectAvatarMotion, type AvatarMotion } from './avatarMotion'

type NexusExplorerProps = {
  onMove?: (position: [number, number, number]) => void
  initialPosition?: [number, number, number]
  onInteract?: (position: [number, number, number]) => void
  abilities?: readonly ('neon' | 'wind' | 'mecha')[]
  onAbility?: (ability: 'run' | 'pulse' | 'jump', position: [number, number, number]) => void
}

const avatarUrl = `${import.meta.env.BASE_URL}assets/lumi-hero.vrm`
const motionUrls = [
  `${import.meta.env.BASE_URL}assets/animations/lumi-idle.vrma`,
  `${import.meta.env.BASE_URL}assets/animations/lumi-walk.vrma`,
  `${import.meta.env.BASE_URL}assets/animations/lumi-happy.vrma`,
]

export function VrmLumi({ moving, celebrating = false }: { moving: MutableRefObject<boolean>, celebrating?: boolean }) {
  const gltf = useLoader(GLTFLoader, avatarUrl, (loader) => loader.register((parser) => new VRMLoaderPlugin(parser)))
  const motionGltfs = useLoader(GLTFLoader, motionUrls, (loader) => loader.register((parser) => new VRMAnimationLoaderPlugin(parser)))
  const vrm = gltf.userData.vrm as VRM | undefined
  const visual = useRef<Group>(null)
  const mixer = useRef<AnimationMixer | null>(null)
  const actions = useRef<Partial<Record<AvatarMotion, AnimationAction>>>({})
  const activeMotion = useRef<AvatarMotion>('idle')

  useEffect(() => {
    if (!vrm?.meta || !('metaVersion' in vrm.meta)) return
    if (needsVrm0Rotation(vrm.meta.metaVersion)) VRMUtils.rotateVRM0(vrm)
  }, [vrm])

  useEffect(() => {
    if (!vrm) return
    const [idleGltf, walkGltf, happyGltf] = motionGltfs
    const idleAnimation = idleGltf?.userData.vrmAnimations?.[0]
    const walkAnimation = walkGltf?.userData.vrmAnimations?.[0]
    const happyAnimation = happyGltf?.userData.vrmAnimations?.[0]
    if (!idleAnimation || !walkAnimation || !happyAnimation) return

    const nextMixer = new AnimationMixer(vrm.scene)
    const idle = nextMixer.clipAction(createVRMAnimationClip(idleAnimation, vrm)).setLoop(LoopRepeat, Infinity)
    const walk = nextMixer.clipAction(createVRMAnimationClip(walkAnimation, vrm)).setLoop(LoopRepeat, Infinity)
    const happy = nextMixer.clipAction(createVRMAnimationClip(happyAnimation, vrm)).setLoop(LoopOnce, 1)
    happy.clampWhenFinished = true
    actions.current = { idle, walk, happy }
    activeMotion.current = 'idle'
    idle.play()
    mixer.current = nextMixer

    return () => {
      nextMixer.stopAllAction()
      mixer.current = null
      actions.current = {}
    }
  }, [motionGltfs, vrm])

  useFrame(({ clock }, delta) => {
    if (!vrm) return
    const nextMotion = selectAvatarMotion({ moving: moving.current, celebrating })
    if (nextMotion !== activeMotion.current) {
      actions.current[activeMotion.current]?.fadeOut(0.16)
      actions.current[nextMotion]?.reset().setEffectiveWeight(1).fadeIn(0.16).play()
      activeMotion.current = nextMotion
    }
    mixer.current?.update(delta)
    vrm.update(delta)
    vrm.expressionManager?.setValue('blink', Math.max(0, Math.sin(clock.elapsedTime * 2.1) - 0.94) * 16)
  })

  if (!vrm) return null
  return <group ref={visual} position={[0, -0.68, 0]} scale={1.42}>
    <primitive object={vrm.scene} />
  </group>
}

export function NexusExplorer({ onMove, onInteract, onAbility, abilities = [], initialPosition = [0, -0.7, 4.8] }: NexusExplorerProps) {
  const { camera, controls } = useThree()
  const explorer = useRef<Group>(null)
  const moving = useRef(false)
  const pressedKeys = useRef(new Set<string>())
  const jumpQueued = useRef(false)
  const jump = useRef({ height: 0, velocity: 0 })
  const velocity = useRef<[number, number, number]>([0, 0, 0])
  const pulse = useRef<Group>(null)
  const pulseAge = useRef(10)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) jumpQueued.current = true
      }
      if (event.code === 'KeyE' && !event.repeat && explorer.current) onInteract?.([explorer.current.position.x, 0, explorer.current.position.z])
      if (event.code === 'KeyQ' && !event.repeat && abilities.includes('wind') && explorer.current) {
        pulseAge.current = 0
        onAbility?.('pulse', [explorer.current.position.x, 0, explorer.current.position.z])
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
  }, [onInteract, onAbility, abilities])

  useFrame(({ clock }, delta) => {
    if (!explorer.current) return
    const launched = jumpQueued.current && jump.current.height === 0
    if (launched && abilities.includes('mecha')) onAbility?.('jump', [explorer.current.position.x, 0, explorer.current.position.z])
    jump.current = advanceJump(jump.current, jumpQueued.current, delta, abilities.includes('mecha'))
    jumpQueued.current = false
    pulseAge.current += delta
    if (pulse.current) {
      pulse.current.visible = pulseAge.current < 0.6
      pulse.current.position.z = 0.6 + pulseAge.current * 5
      pulse.current.scale.setScalar(1 + pulseAge.current)
    }
    explorer.current.position.y = -0.7 + jump.current.height
    const direction = movementFromKeys(pressedKeys.current)
    const running = abilities.includes('neon') && (pressedKeys.current.has('ShiftLeft') || pressedKeys.current.has('ShiftRight')) && Boolean(direction[0] || direction[2])
    velocity.current = smoothVelocity(velocity.current, direction, delta, running ? 5.4 : 2.7)
    const [x, , z] = velocity.current
    moving.current = Math.hypot(x, z) > 0.15
    if (moving.current) {
      const next = moveExplorer([explorer.current.position.x, 0, explorer.current.position.z], velocity.current, delta)
      const dx = next[0] - explorer.current.position.x
      const dz = next[2] - explorer.current.position.z
      const orbit = controls as OrbitControlsImpl | null
      if (orbit) {
        orbit.target.x += dx
        orbit.target.z += dz
        camera.position.x += dx
        camera.position.z += dz
      }
      explorer.current.position.x = next[0]
      explorer.current.position.z = next[2]
      if (running) onAbility?.('run', next)
      if (direction[0] || direction[2]) explorer.current.rotation.y = smoothTurn(explorer.current.rotation.y, Math.atan2(direction[0], direction[2]), delta)
      onMove?.(next)
    }
  })

  return (
    <group ref={explorer} position={initialPosition} scale={1.08}>
      <group position={[0, 0.55, 0]}>
        <group ref={pulse} visible={false} position={[0, 0.7, 0.6]}><mesh><sphereGeometry args={[0.22, 16, 12]} /><meshBasicMaterial color="#66ffd8" /></mesh><pointLight color="#66ffd8" intensity={6} distance={3} /></group>
        <VrmLumi moving={moving} />
        <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.58, 0.67, 40]} /><meshBasicMaterial color="#b486ff" transparent opacity={0.78} /></mesh>
        <pointLight position={[0, 0.35, 0.25]} color="#7cecff" intensity={1.1} distance={3.5} />
        <Text position={[0, 1.9, 0]} fontSize={0.13} color="#d8faff" anchorX="center">LUMI · EXPLORADORA</Text>
      </group>
    </group>
  )
}
