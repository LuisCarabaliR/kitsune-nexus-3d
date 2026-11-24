import { describe, expect, it } from 'vitest'
import { activateRelic, answerMission, createExplorationProgress, createMissionState, exploreStation, isMissionReady, explorationCount, missionGateAtPosition, relicAtPosition, relicProgress, selectGateOnJump, startMission } from './nexusExploration'
import { getStation } from '../data/stations'

const mecha = getStation('mecha')!
const readyMission = (stationId: 'neon' | 'wind' | 'mecha') => [0, 1, 2].reduce((state, relicId) => activateRelic(state, relicId), startMission(createMissionState(stationId)))

describe('nexus mission risk model', () => {
  it('keeps the mission active after one wrong answer and sends Lumi to the void on the second', () => {
    const active = readyMission('mecha')
    const firstMistake = answerMission(active, mecha, 1)

    expect(firstMistake.phase).toBe('active')
    expect(firstMistake.failures).toBe(1)
    expect(answerMission(firstMistake, mecha, 2)).toMatchObject({ phase: 'void', failures: 2 })
  })

  it('stabilizes the mission immediately when the correct gate is chosen', () => {
    const active = readyMission('mecha')

    expect(answerMission(active, mecha, mecha.room.challenge.correctOption)).toMatchObject({ phase: 'success', failures: 0 })
  })

  it('requires three unique resonance relics before the answer gates become active', () => {
    const active = startMission(createMissionState('neon'))
    const firstRelic = activateRelic(active, 0)
    const duplicateRelic = activateRelic(firstRelic, 0)
    const ready = [1, 2].reduce((state, relicId) => activateRelic(state, relicId), duplicateRelic)

    expect(relicProgress(active)).toBe(0)
    expect(relicProgress(duplicateRelic)).toBe(1)
    expect(isMissionReady(firstRelic)).toBe(false)
    expect(isMissionReady(ready)).toBe(true)
    expect(answerMission(firstRelic, getStation('neon')!, 0)).toBe(firstRelic)
  })

  it('awards a Nexus ability for a stabilized mission', () => {
    const neon = getStation('neon')!
    const result = answerMission(readyMission('neon'), neon, neon.room.challenge.correctOption)

    expect(result.reward).toEqual({ name: 'Pulso de neón', icon: '✦' })
  })

  it('only selects a mission gate when Lumi is close enough to it', () => {
    expect(missionGateAtPosition([0, 0, 2.65])).toBe(1)
    expect(missionGateAtPosition([8, 0, 8])).toBeNull()
  })

  it('selects a nearby gate when Lumi jumps and leaves it untouched otherwise', () => {
    expect(selectGateOnJump([0, 0, 3.45], true)).toBe(1)
    expect(selectGateOnJump([0, 0, 3.45], false)).toBeNull()
  })

  it('finds relics only when Lumi explores their physical location', () => {
    expect(relicAtPosition([-5.2, 0, 3.55])).toBe(0)
    expect(relicAtPosition([8, 0, 8])).toBeNull()
  })

  it('counts each explored station once', () => {
    const visited = exploreStation(createExplorationProgress(), 'neon')

    expect(explorationCount(exploreStation(visited, 'neon'))).toBe(1)
  })
})
