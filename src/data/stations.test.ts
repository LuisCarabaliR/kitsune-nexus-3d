import { describe, expect, it } from 'vitest'
import { getStation, stations } from './stations'

describe('station catalog', () => {
  it('contains the three named Nexus stations', () => {
    expect(stations.map((station) => station.name)).toEqual([
      'Ciudad Neón',
      'Santuario del Viento',
      'Hangar Mecha',
    ])
  })

  it('returns undefined for an unknown station', () => {
    expect(getStation('unknown')).toBeUndefined()
  })
})
