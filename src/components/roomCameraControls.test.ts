import { describe, expect, it } from 'vitest'
import { roomCameraOrbit } from './roomCameraControls'

describe('room camera controls', () => {
  it('allows close inspection while preserving a useful view of each room', () => {
    expect(roomCameraOrbit).toEqual({ minDistance: 3.5, maxDistance: 24, minPolarAngle: 0.35, maxPolarAngle: Math.PI / 2.03 })
  })
})
