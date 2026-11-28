import { describe, expect, it } from 'vitest'
import { advanceDoubleJump, advanceJump, moveExplorer, moveRoomExplorer, smoothTurn, smoothVelocity } from './roomMovement'

describe('expanded Nexus movement', () => {
  it('allows one extra jump only when unlocked and restores jumps on landing', () => {
    const first = advanceDoubleJump({ height: 0, velocity: 0, jumps: 0 }, true, 0.05, true)
    const second = advanceDoubleJump(first.state, true, 0.05, true)
    expect(second.didDoubleJump).toBe(true)
    expect(advanceDoubleJump(second.state, true, 0.05, true).didDoubleJump).toBe(false)
    expect(advanceDoubleJump(first.state, true, 0.05, false).didDoubleJump).toBe(false)
    expect(advanceDoubleJump({ height: 0.01, velocity: -4, jumps: 2 }, false, 0.1, true).state.jumps).toBe(0)
  })
  it('launches a higher jump when the Mecha ability is unlocked', () => {
    const initial = { height: 0, velocity: 0 }
    expect(advanceJump(initial, true, 0.1, true).height).toBeGreaterThan(advanceJump(initial, true, 0.1).height)
  })
  it('allows Lumi to reach the outer districts while keeping her inside the map', () => {
    expect(moveExplorer([29, 0, 0], [1, 0, 0], 3)).toEqual([30, 0, 0])
  })

  it('keeps Lumi out of room structures while allowing a route around them', () => {
    expect(moveRoomExplorer('neon', [0, 0, 2], [0, 0, -1], 0.8)).toEqual([0, 0, 2])
    expect(moveRoomExplorer('neon', [3, 0, 2], [1, 0, 0], 0.8)).toEqual([3.8, 0, 2])
  })

  it('eases velocity and rotation instead of snapping to an input direction', () => {
    const velocity = smoothVelocity([0, 0, 0], [1, 0, 0], 0.05)
    expect(velocity[0]).toBeGreaterThan(0)
    expect(velocity[0]).toBeLessThan(2.8)
    expect(smoothTurn(0, Math.PI, 0.05)).toBeGreaterThan(0)
    expect(smoothTurn(0, Math.PI, 0.05)).toBeLessThan(Math.PI)
  })

  it('brakes quickly after the explorer releases the movement key', () => {
    const stopped = smoothVelocity([2.8, 0, 0], [0, 0, 0], 0.12)

    expect(stopped[0]).toBeLessThan(0.5)
  })
})
