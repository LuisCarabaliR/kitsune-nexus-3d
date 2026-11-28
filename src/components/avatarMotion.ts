export type AvatarMotion = 'idle' | 'walk' | 'run' | 'happy' | 'jump' | 'doubleJump'

export function selectAvatarMotion({ moving, celebrating, running = false, jump = 0 }: { moving: boolean, celebrating: boolean, running?: boolean, jump?: number }): AvatarMotion {
  if (jump >= 2) return 'doubleJump'
  if (jump === 1) return 'jump'
  if (moving && running) return 'run'
  if (moving) return 'walk'
  if (celebrating) return 'happy'
  return 'idle'
}
