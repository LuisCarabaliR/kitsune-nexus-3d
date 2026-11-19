import { describe, expect, it } from 'vitest'
import { createExplorationProgress, exploreStation } from './nexusExploration'
import { loadExplorationProgress, saveExplorationProgress } from './nexusProgressStorage'

describe('nexus progress storage', () => {
  it('falls back to a fresh progress object when saved data is malformed', () => {
    const storage = { getItem: () => '{bad json', setItem: () => undefined, removeItem: () => undefined }
    expect(loadExplorationProgress(storage)).toEqual(createExplorationProgress())
  })

  it('recovers saved explored stations', () => {
    let saved = ''
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value }, removeItem: () => undefined }
    saveExplorationProgress(storage, exploreStation(createExplorationProgress(), 'wind'))
    expect(loadExplorationProgress(storage).exploredStationIds).toEqual(['wind'])
  })
})
