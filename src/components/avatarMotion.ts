export type AvatarMotion = 'idle' | 'walk' | 'run' | 'happy'

export function selectAvatarMotion({ moving, celebrating, running = false }: { moving: boolean, celebrating: boolean, running?: boolean }): AvatarMotion {
  if (moving && running) return 'run'
  if (moving) return 'walk'
  if (celebrating) return 'happy'
  return 'idle'
}
