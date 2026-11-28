export type AvatarMotion = 'idle' | 'walk' | 'run' | 'happy' | 'jump' | 'air' | 'doubleJump'

export function selectAvatarMotion({ moving, celebrating, running = false, jump = 0, airTime = 0 }: { moving: boolean, celebrating: boolean, running?: boolean, jump?: number, airTime?: number }): AvatarMotion {
  if (jump >= 2) return 'doubleJump'
  if (jump === 1) return airTime < 0.2 ? 'jump' : 'air'
  if (moving && running) return 'run'
  if (moving) return 'walk'
  if (celebrating) return 'happy'
  return 'idle'
}
