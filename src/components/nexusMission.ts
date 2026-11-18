import type { Station } from '../data/stations'

export type NexusMission = {
  readonly activeCoreIds: readonly Station['id'][]
}

export function createMission(): NexusMission {
  return { activeCoreIds: [] }
}

export function activateCore(mission: NexusMission, id: Station['id']): NexusMission {
  if (mission.activeCoreIds.includes(id)) return mission

  return { activeCoreIds: [...mission.activeCoreIds, id] }
}

export function isPortalUnlocked(mission: NexusMission, id: Station['id']): boolean {
  return mission.activeCoreIds.includes(id)
}

export function missionProgress(mission: NexusMission): number {
  return mission.activeCoreIds.length
}
