export type MovementVector = [number, number, number]
export type ExplorerPosition = [number, number, number]
export type JumpState = { height: number, velocity: number }

const plazaPylons: ReadonlyArray<readonly [number, number]> = [[4, 4.8], [-4, 2.2], [0, -4.2]]

export function movementFromKeys(keys: Set<string>): MovementVector {
  const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
  const z = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'))

  return [x, 0, z]
}

export function moveExplorer(position: ExplorerPosition, direction: MovementVector, distance: number): ExplorerPosition {
  const next: ExplorerPosition = [
    Math.max(-7.4, Math.min(7.4, position[0] + direction[0] * distance)),
    0,
    Math.max(-7.4, Math.min(7.4, position[2] + direction[2] * distance)),
  ]
  const crossesPylon = plazaPylons.some(([x, z]) => Math.hypot(next[0] - x, next[2] - z) < 1.1)

  return crossesPylon ? position : next
}

export function advanceJump(state: JumpState, jumpQueued: boolean, delta: number): JumpState {
  const launchVelocity = jumpQueued && state.height === 0 ? 4.6 : state.velocity
  const velocity = launchVelocity - 11 * delta
  const height = Math.max(0, state.height + velocity * delta)

  return height === 0 ? { height, velocity: 0 } : { height, velocity }
}
