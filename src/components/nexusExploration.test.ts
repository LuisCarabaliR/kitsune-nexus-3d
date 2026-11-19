import { describe, expect, it } from 'vitest'
import { answerMission, createExplorationProgress, createMissionState, exploreStation, explorationCount, startMission } from './nexusExploration'
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

  it('counts each explored station once', () => {
    const visited = exploreStation(createExplorationProgress(), 'neon')

    expect(explorationCount(exploreStation(visited, 'neon'))).toBe(1)
  })
})
