import { describe, expect, it } from 'vitest'
import { selectAvatarMotion } from './avatarMotion'

describe('avatar motion state', () => {
  it('uses the walking clip only while Lumi is moving', () => {
    expect(selectAvatarMotion({ moving: false, celebrating: false })).toBe('idle')
    expect(selectAvatarMotion({ moving: true, celebrating: false })).toBe('walk')
  })

  it('prioritizes the celebration after a completed mission', () => {
    expect(selectAvatarMotion({ moving: true, celebrating: true })).toBe('happy')
  })
})
