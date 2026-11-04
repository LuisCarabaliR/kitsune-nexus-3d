import { describe, expect, it } from 'vitest'
import { stations } from '../data/stations'
import { portalPositions } from './nexusSceneModel'

describe('portalPositions', () => {
  it('places the three stations at distinct positions', () => {
    const positions = portalPositions(stations)

    expect(positions).toHaveLength(3)
    expect(new Set(positions.map((position) => position.join(','))).size).toBe(3)
    expect(positions.every(([x]) => Math.abs(x) >= 0)).toBe(true)
  })
})
