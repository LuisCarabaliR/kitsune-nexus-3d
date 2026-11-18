import { describe, expect, it } from 'vitest'
import { stations } from '../data/stations'
import { portalAtPosition, portalPositions } from './nexusSceneModel'
import { vortexPulse } from './NexusPortal'

describe('portalPositions', () => {
  it('places the three stations at distinct positions', () => {
    const positions = portalPositions(stations)

    expect(positions).toHaveLength(3)
    expect(new Set(positions.map((position) => position.join(','))).size).toBe(3)
    expect(positions.every(([x]) => Math.abs(x) >= 0)).toBe(true)
  })

  it('pulses a portal vortex above its resting scale', () => {
    expect(vortexPulse(0)).toBe(1)
    expect(vortexPulse(Math.PI / 2)).toBeGreaterThan(1)
  })

  it('identifies the portal when the explorer reaches its entrance', () => {
    expect(portalAtPosition([-4.2, 0, -0.4], stations)).toBe('neon')
    expect(portalAtPosition([0, 0, 4.8], stations)).toBeUndefined()
  })
})
