import { describe, expect, it } from 'vitest'
import { needsVrm0Rotation } from './vrmOrientation'

describe('VRM orientation', () => {
  it('does not rotate a VRM 1.0 avatar as if it were legacy VRM 0', () => {
    expect(needsVrm0Rotation('1.0')).toBe(false)
  })

  it('keeps the compatibility rotation only for legacy VRM 0 avatars', () => {
    expect(needsVrm0Rotation('0')).toBe(true)
  })
})
