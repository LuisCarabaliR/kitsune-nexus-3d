import type { Station } from '../data/stations'

export type ExperienceMode = 'nexus' | 'room'

export type ExperienceState = {
  mode: ExperienceMode
  stationId: Station['id']
}

export type RoomDetails = Pick<Station, 'id' | 'name'> & {
  mission: string
  learningPoints: [string, string, string]
}

export function enterRoom(stationId: Station['id']): ExperienceState {
  return { mode: 'room', stationId }
}

export function returnToNexus(state: ExperienceState): ExperienceState {
  return { ...state, mode: 'nexus' }
}

export function roomDetails(station: Station): RoomDetails {
  return {
    id: station.id,
    name: station.name,
    mission: station.room.mission,
    learningPoints: station.room.learningPoints,
  }
}
