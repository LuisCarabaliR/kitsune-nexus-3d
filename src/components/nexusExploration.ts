import type { Station } from '../data/stations'

export type MissionPhase = 'idle' | 'active' | 'success' | 'void'

export type RoomMissionState = {
  readonly stationId: Station['id']
  readonly phase: MissionPhase
  readonly failures: number
}

export type ExplorationProgress = {
  readonly exploredStationIds: readonly Station['id'][]
}

export function createExplorationProgress(): ExplorationProgress {
  return { exploredStationIds: [] }
}

export function exploreStation(progress: ExplorationProgress, id: Station['id']): ExplorationProgress {
  if (progress.exploredStationIds.includes(id)) return progress
  return { exploredStationIds: [...progress.exploredStationIds, id] }
}

export function explorationCount(progress: ExplorationProgress): number {
  return progress.exploredStationIds.length
}

export function createMissionState(stationId: Station['id']): RoomMissionState {
  return { stationId, phase: 'idle', failures: 0 }
}

export function startMission(state: RoomMissionState): RoomMissionState {
  return { ...state, phase: 'active', failures: 0 }
}

export function answerMission(state: RoomMissionState, station: Station, option: number): RoomMissionState {
  if (state.phase !== 'active') return state
  if (option === station.room.challenge.correctOption) return { ...state, phase: 'success' }

  const failures = state.failures + 1
  return { ...state, failures, phase: failures >= 2 ? 'void' : 'active' }
}
