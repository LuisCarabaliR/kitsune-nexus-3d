import { describe, expect, it } from 'vitest'
import { moveExplorer } from './roomMovement'

describe('expanded Nexus movement', () => {
  it('allows Lumi to reach the outer districts while keeping her inside the map', () => {
    expect(moveExplorer([10.9, 0, 0], [1, 0, 0], 2)).toEqual([11.5, 0, 0])
  })
})
