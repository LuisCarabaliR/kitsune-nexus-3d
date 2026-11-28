export const resonanceSequence = [0, 2, 1, 0] as const
export type FinalChallenge = { step: number, mistakes: number, complete: boolean }
export const createFinalChallenge = (): FinalChallenge => ({ step: 0, mistakes: 0, complete: false })
export function playResonance(state: FinalChallenge, choice: number): FinalChallenge {
  if (state.complete || !Number.isInteger(choice) || choice < 0 || choice > 2) return state
  if (choice !== resonanceSequence[state.step]) return { ...state, step: 0, mistakes: state.mistakes + 1 }
  const step = state.step + 1
  return { ...state, step, complete: step === resonanceSequence.length }
}
