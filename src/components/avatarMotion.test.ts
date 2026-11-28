import { describe, expect, it } from 'vitest'
import { selectAvatarMotion } from './avatarMotion'

describe('avatar motion state', () => {
  it('prioritizes the correct airborne animation over running or celebration', () => {
    expect(selectAvatarMotion({ moving: true, running: true, celebrating: false, jump: 1 })).toBe('jump')
    expect(selectAvatarMotion({ moving: true, celebrating: true, jump: 2 })).toBe('doubleJump')
  })
  it('uses the walking clip only while Lumi is moving', () => {
    expect(selectAvatarMotion({ moving: false, celebrating: false })).toBe('idle')
    expect(selectAvatarMotion({ moving: true, celebrating: false })).toBe('walk')
  })

  it('switches to the running clip only while moving and running', () => {
    expect(selectAvatarMotion({ moving: true, running: true, celebrating: false })).toBe('run')
    expect(selectAvatarMotion({ moving: false, running: true, celebrating: false })).toBe('idle')
  })

  it('keeps Lumi walking after a completed mission when the player moves', () => {
    expect(selectAvatarMotion({ moving: true, celebrating: true })).toBe('walk')
    expect(selectAvatarMotion({ moving: false, celebrating: true })).toBe('happy')
  })
})
