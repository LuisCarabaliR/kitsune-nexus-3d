export type MovementVector = [number, number, number]
export type ExplorerPosition = [number, number, number]
export type JumpState = { height: number, velocity: number }
export type RoomId = 'neon' | 'wind' | 'mecha'

const plazaPylons: ReadonlyArray<readonly [number, number]> = [[-23, 7], [23, 7], [-23, -14], [23, -14]]
const plazaLimit = 30
const roomObstacles: Record<RoomId, ReadonlyArray<readonly [number, number, number]>> = {
  neon: [[0, 0, 1.55], [-5.4, -1.4, 1.25], [5.4, -1.4, 1.25]],
  wind: [[0, 0, 1.55], [-5.2, 1.7, 1.35], [5.2, 1.7, 1.35]],
  mecha: [[0, 0, 1.55], [-4.9, -1.5, 1.2], [4.9, -1.5, 1.2]],
}

export function movementFromKeys(keys: Set<string>): MovementVector {
  const rawX = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
  const rawZ = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'))
  const magnitude = Math.hypot(rawX, rawZ)
  const x = magnitude > 1 ? rawX / magnitude : rawX
  const z = magnitude > 1 ? rawZ / magnitude : rawZ

  return [x, 0, z]
}

export function smoothVelocity(current: MovementVector, direction: MovementVector, delta: number, maxSpeed = 2.8): MovementVector {
  const moving = Boolean(direction[0] || direction[2])
  const response = 1 - Math.exp(-delta * (moving ? 13 : 16))
  return [
    current[0] + (direction[0] * maxSpeed - current[0]) * response,
    0,
    current[2] + (direction[2] * maxSpeed - current[2]) * response,
  ]
}

export function smoothTurn(current: number, target: number, delta: number): number {
  const shortest = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + shortest * Math.min(1, delta * 10)
}

export function moveExplorer(position: ExplorerPosition, direction: MovementVector, distance: number): ExplorerPosition {
  const next: ExplorerPosition = [
    Math.max(-plazaLimit, Math.min(plazaLimit, position[0] + direction[0] * distance)),
    0,
    Math.max(-plazaLimit, Math.min(plazaLimit, position[2] + direction[2] * distance)),
  ]
  const crossesPylon = plazaPylons.some(([x, z]) => Math.hypot(next[0] - x, next[2] - z) < 1.1)

  return crossesPylon ? position : next
}

export function moveRoomExplorer(room: RoomId, position: ExplorerPosition, direction: MovementVector, distance: number): ExplorerPosition {
  const next: ExplorerPosition = [
    Math.max(-13, Math.min(13, position[0] + direction[0] * distance)),
    0,
    Math.max(-12, Math.min(12, position[2] + direction[2] * distance)),
  ]
  const hitsStructure = roomObstacles[room].some(([x, z, radius]) => Math.hypot(next[0] - x, next[2] - z) < radius)
  return hitsStructure ? position : next
}

export function advanceJump(state: JumpState, jumpQueued: boolean, delta: number, boost = false): JumpState {
  const launchVelocity = jumpQueued && state.height === 0 ? (boost ? 6.2 : 4.6) : state.velocity
  const velocity = launchVelocity - 11 * delta
  const height = Math.max(0, state.height + velocity * delta)

  return height === 0 ? { height, velocity: 0 } : { height, velocity }
}

export function explorerWalkSwing(elapsedTime: number, moving: boolean): number {
  return moving ? Math.sin(elapsedTime * 5.2) * 0.18 : 0
}
