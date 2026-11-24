import type { Station } from '../data/stations'

export type MissionPhase = 'idle' | 'active' | 'success' | 'void'

export type NexusReward = {
  readonly name: string
  readonly icon: string
}

const stationRewards: Record<Station['id'], NexusReward> = {
  neon: { name: 'Pulso de neón', icon: '✦' },
  wind: { name: 'Paso aéreo', icon: '◌' },
  mecha: { name: 'Blindaje PBR', icon: '⬡' },
}

export type RoomMissionState = {
  readonly stationId: Station['id']
  readonly phase: MissionPhase
  readonly failures: number
  readonly activatedRelicIds: readonly number[]
  readonly reward?: NexusReward
}

export type ExplorationProgress = {
  readonly exploredStationIds: readonly Station['id'][]
}

export const missionGatePositions: ReadonlyArray<readonly [number, number, number]> = [
  [-2.15, 0, 2.65],
  [0, 0, 2.65],
  [2.15, 0, 2.65],
]

export const missionRelicPositions: ReadonlyArray<readonly [number, number, number]> = [
  [-5.2, 0, 3.55],
  [0, 0, -3.4],
  [5.2, 0, 3.55],
]

export function missionGateAtPosition(position: readonly [number, number, number]): number | null {
  const gateIndex = missionGatePositions.findIndex(([x, , z]) => Math.hypot(position[0] - x, position[2] - z) < 1.55)
  return gateIndex === -1 ? null : gateIndex
}

export function selectGateOnJump(position: readonly [number, number, number], jumped: boolean): number | null {
  return jumped ? missionGateAtPosition(position) : null
}

export function relicAtPosition(position: readonly [number, number, number]): number | null {
  const relicIndex = missionRelicPositions.findIndex(([x, , z]) => Math.hypot(position[0] - x, position[2] - z) < 1.25)
  return relicIndex === -1 ? null : relicIndex
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
  return { stationId, phase: 'idle', failures: 0, activatedRelicIds: [] }
}

export function startMission(state: RoomMissionState): RoomMissionState {
  return { ...state, phase: 'active', failures: 0, activatedRelicIds: [] }
}

export function activateRelic(state: RoomMissionState, relicId: number): RoomMissionState {
  if (state.phase !== 'active' || relicId < 0 || relicId >= missionRelicPositions.length || state.activatedRelicIds.includes(relicId)) return state
  return { ...state, activatedRelicIds: [...state.activatedRelicIds, relicId] }
}

export function relicProgress(state: RoomMissionState): number {
  return state.activatedRelicIds.length
}

export function isMissionReady(state: RoomMissionState): boolean {
  return relicProgress(state) === missionRelicPositions.length
}

export function answerMission(state: RoomMissionState, station: Station, option: number): RoomMissionState {
  if (state.phase !== 'active' || !isMissionReady(state)) return state
  if (option === station.room.challenge.correctOption) return { ...state, phase: 'success', reward: stationRewards[station.id] }

  const failures = state.failures + 1
  return { ...state, failures, phase: failures >= 2 ? 'void' : 'active' }
}
