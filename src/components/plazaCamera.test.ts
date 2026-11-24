import { describe, expect, it } from 'vitest'
import { plazaCameraPose } from './plazaCamera'

describe('plaza camera pose', () => {
  it('frames Lumi from behind while keeping a view forward into the Nexus', () => {
    const pose = plazaCameraPose([0, -0.7, 9])

    expect(pose.position).toEqual([0, 9.5, 28.5])
    expect(pose.target).toEqual([0, 0.25, 4.5])
  })
})
