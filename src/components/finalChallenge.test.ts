import { describe, expect, it } from 'vitest'
import { createFinalChallenge, playResonance, resonanceSequence } from './finalChallenge'

describe('central resonance challenge', () => {
  it('completes only after the full sequence and resets on a wrong choice', () => {
    const first = playResonance(createFinalChallenge(), 0)
    const wrong = playResonance(first, 1)
    expect(wrong).toEqual({ step: 0, mistakes: 1, complete: false })
    const complete = resonanceSequence.reduce((state, choice) => playResonance(state, choice), wrong)
    expect(complete.complete).toBe(true)
    expect(playResonance(complete, 1)).toBe(complete)
  })
})
