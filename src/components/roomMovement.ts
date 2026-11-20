export type MovementVector = [number, number, number]
export type ExplorerPosition = [number, number, number]
export type JumpState = { height: number, velocity: number }
export type RoomId = 'neon' | 'wind' | 'mecha'

const plazaPylons: ReadonlyArray<readonly [number, number]> = [[4, 4.8], [-4, 2.2], [0, -4.2]]
const roomObstacles: Record<RoomId, ReadonlyArray<readonly [number, number, number]>> = {
  neon: [[0, 0, 1.55], [-5.4, -1.4, 1.25], [5.4, -1.4, 1.25]],
  wind: [[0, 0, 1.55], [-5.2, 1.7, 1.35], [5.2, 1.7, 1.35]],
  mecha: [[0, 0, 1.55], [-4.9, -1.5, 1.2], [4.9, -1.5, 1.2]],
}

export function movementFromKeys(keys: Set<string>): MovementVector {
  const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
  const z = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'))

  return [x, 0, z]
}

export function moveExplorer(position: ExplorerPosition, direction: MovementVector, distance: number): ExplorerPosition {
  const next: ExplorerPosition = [
    Math.max(-11.5, Math.min(11.5, position[0] + direction[0] * distance)),
    0,
    Math.max(-11.5, Math.min(11.5, position[2] + direction[2] * distance)),
  ]
  const crossesPylon = plazaPylons.some(([x, z]) => Math.hypot(next[0] - x, next[2] - z) < 1.1)

  return crossesPylon ? position : next
}

export function moveRoomExplorer(room: RoomId, position: ExplorerPosition, direction: MovementVector, distance: number): ExplorerPosition {
  const next: ExplorerPosition = [
    Math.max(-6.1, Math.min(6.1, position[0] + direction[0] * distance)),
    0,
    Math.max(-5.6, Math.min(6.5, position[2] + direction[2] * distance)),
  ]
  const hitsStructure = roomObstacles[room].some(([x, z, radius]) => Math.hypot(next[0] - x, next[2] - z) < radius)
  return hitsStructure ? position : next
}

export function advanceJump(state: JumpState, jumpQueued: boolean, delta: number): JumpState {
  const launchVelocity = jumpQueued && state.height === 0 ? 4.6 : state.velocity
  const velocity = launchVelocity - 11 * delta
  const height = Math.max(0, state.height + velocity * delta)

  return height === 0 ? { height, velocity: 0 } : { height, velocity }
}

export function explorerWalkSwing(elapsedTime: number, moving: boolean): number {
  return moving ? Math.sin(elapsedTime * 4) * 0.55 : 0
}
