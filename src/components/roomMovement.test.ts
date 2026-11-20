import { describe, expect, it } from 'vitest'
import { moveExplorer, moveRoomExplorer } from './roomMovement'

describe('expanded Nexus movement', () => {
  it('allows Lumi to reach the outer districts while keeping her inside the map', () => {
    expect(moveExplorer([10.9, 0, 0], [1, 0, 0], 2)).toEqual([11.5, 0, 0])
  })

  it('keeps Lumi out of room structures while allowing a route around them', () => {
    expect(moveRoomExplorer('neon', [0, 0, 2], [0, 0, -1], 0.8)).toEqual([0, 0, 2])
    expect(moveRoomExplorer('neon', [3, 0, 2], [1, 0, 0], 0.8)).toEqual([3.8, 0, 2])
  })
})
