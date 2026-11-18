import { describe, expect, it } from 'vitest'
import { roomDetails, enterRoom, returnToNexus } from './nexusNavigation'
import { advanceJump, explorerWalkSwing, moveExplorer, movementFromKeys } from './roomMovement'
import { activateCore, createMission, isPortalUnlocked, missionProgress } from './nexusMission'
import { stations } from '../data/stations'

describe('guided room navigation', () => {
  it('enters a room and returns to the selected station in the Nexus', () => {
    const entered = enterRoom('mecha')

    expect(entered).toEqual({ mode: 'room', stationId: 'mecha' })
    expect(returnToNexus(entered)).toEqual({ mode: 'nexus', stationId: 'mecha' })
  })

  it('provides a distinct mission and three learning points for every station', () => {
    const details = stations.map(roomDetails)

    expect(details.every((detail) => detail.learningPoints.length === 3)).toBe(true)
    expect(new Set(details.map((detail) => detail.mission)).size).toBe(3)
  })

  it('maps keyboard input to a first-person movement vector', () => {
    expect(movementFromKeys(new Set(['KeyW', 'KeyD']))).toEqual([1, 0, -1])
    expect(movementFromKeys(new Set(['ArrowDown']))).toEqual([0, 0, 1])
  })

  it('activates each energy core only once and reports progress', () => {
    const afterFirst = activateCore(createMission(), 'neon')

    expect(missionProgress(afterFirst)).toBe(1)
    expect(missionProgress(activateCore(afterFirst, 'neon'))).toBe(1)
  })

  it('unlocks only the portal matched to an active core', () => {
    const mission = activateCore(createMission(), 'wind')

    expect(isPortalUnlocked(mission, 'wind')).toBe(true)
    expect(isPortalUnlocked(mission, 'mecha')).toBe(false)
  })

  it('stops the explorer before crossing a plaza pylon', () => {
    expect(moveExplorer([0, 0, 4.8], [1, 0, 0], 4)).toEqual([0, 0, 4.8])
  })

  it('launches the explorer upward when space queues a jump from the ground', () => {
    const jumped = advanceJump({ height: 0, velocity: 0 }, true, 0.05)

    expect(jumped.height).toBeGreaterThan(0)
    expect(jumped.velocity).toBeGreaterThan(0)
  })

  it('animates the explorer stride only while moving', () => {
    expect(explorerWalkSwing(Math.PI / 8, false)).toBe(0)
    expect(explorerWalkSwing(Math.PI / 8, true)).not.toBe(0)
  })
})
