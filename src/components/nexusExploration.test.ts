import { describe, expect, it } from 'vitest'
import { answerMission, createExplorationProgress, createMissionState, exploreStation, explorationCount, missionGateAtPosition, startMission } from './nexusExploration'
import { getStation } from '../data/stations'

const mecha = getStation('mecha')!

describe('nexus mission risk model', () => {
  it('keeps the mission active after one wrong answer and sends Lumi to the void on the second', () => {
    const active = startMission(createMissionState('mecha'))
    const firstMistake = answerMission(active, mecha, 1)

    expect(firstMistake.phase).toBe('active')
    expect(firstMistake.failures).toBe(1)
    expect(answerMission(firstMistake, mecha, 2)).toMatchObject({ phase: 'void', failures: 2 })
  })

  it('stabilizes the mission immediately when the correct gate is chosen', () => {
    const active = startMission(createMissionState('mecha'))

    expect(answerMission(active, mecha, mecha.room.challenge.correctOption)).toMatchObject({ phase: 'success', failures: 0 })
  })

  it('awards a Nexus ability for a stabilized mission', () => {
    const neon = getStation('neon')!
    const result = answerMission(startMission(createMissionState('neon')), neon, neon.room.challenge.correctOption)

    expect(result.reward).toEqual({ name: 'Pulso de neón', icon: '✦' })
  })

  it('only selects a mission gate when Lumi is close enough to it', () => {
    expect(missionGateAtPosition([0, 0, 2.65])).toBe(1)
    expect(missionGateAtPosition([8, 0, 8])).toBeNull()
  })

  it('counts each explored station once', () => {
    const visited = exploreStation(createExplorationProgress(), 'neon')

    expect(explorationCount(exploreStation(visited, 'neon'))).toBe(1)
  })
})
