import { describe, expect, it } from 'vitest'
import { selectAvatarMotion } from './avatarMotion'

describe('avatar motion state', () => {
  it('uses the walking clip only while Lumi is moving', () => {
    expect(selectAvatarMotion({ moving: false, celebrating: false })).toBe('idle')
    expect(selectAvatarMotion({ moving: true, celebrating: false })).toBe('walk')
  })

  it('keeps Lumi walking after a completed mission when the player moves', () => {
    expect(selectAvatarMotion({ moving: true, celebrating: true })).toBe('walk')
    expect(selectAvatarMotion({ moving: false, celebrating: true })).toBe('happy')
  })
})
