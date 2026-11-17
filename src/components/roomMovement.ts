export type MovementVector = [number, number, number]

export function movementFromKeys(keys: Set<string>): MovementVector {
  const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
  const z = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'))

  return [x, 0, z]
}
