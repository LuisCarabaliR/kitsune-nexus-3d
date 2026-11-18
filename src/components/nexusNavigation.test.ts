import { describe, expect, it } from 'vitest'
import { roomDetails, enterRoom, returnToNexus } from './nexusNavigation'
import { movementFromKeys } from './roomMovement'
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
})
