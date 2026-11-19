import { createExplorationProgress, type ExplorationProgress } from './nexusExploration'
import type { Station } from '../data/stations'

const storageKey = 'kitsune-nexus-exploration-v1'
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isStationId(value: unknown): value is Station['id'] {
  return value === 'neon' || value === 'wind' || value === 'mecha'
}

export function loadExplorationProgress(storage: StorageLike): ExplorationProgress {
  try {
    const raw = storage.getItem(storageKey)
    if (!raw) return createExplorationProgress()
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as ExplorationProgress).exploredStationIds)) return createExplorationProgress()
    const exploredStationIds = (parsed as ExplorationProgress).exploredStationIds.filter(isStationId)
    return { exploredStationIds: [...new Set(exploredStationIds)] }
  } catch {
    return createExplorationProgress()
  }
}

export function saveExplorationProgress(storage: StorageLike, progress: ExplorationProgress): void {
  storage.setItem(storageKey, JSON.stringify(progress))
}

export function clearExplorationProgress(storage: StorageLike): void {
  storage.removeItem(storageKey)
}
