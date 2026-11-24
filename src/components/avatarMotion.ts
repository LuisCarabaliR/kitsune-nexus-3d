export type AvatarMotion = 'idle' | 'walk' | 'happy'

export function selectAvatarMotion({ moving, celebrating }: { moving: boolean, celebrating: boolean }): AvatarMotion {
  if (moving) return 'walk'
  if (celebrating) return 'happy'
  return 'idle'
}
