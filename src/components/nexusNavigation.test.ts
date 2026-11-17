import { describe, expect, it } from 'vitest'
import { roomDetails, enterRoom, returnToNexus } from './nexusNavigation'
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
})
