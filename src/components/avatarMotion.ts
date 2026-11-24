export type AvatarMotion = 'idle' | 'walk' | 'happy'

export function selectAvatarMotion({ moving, celebrating }: { moving: boolean, celebrating: boolean }): AvatarMotion {
  if (celebrating) return 'happy'
  return moving ? 'walk' : 'idle'
}
