import { describe, expect, it } from 'vitest'
import { missionCoursePlatforms } from './missionCourse'

describe('mission course platforms', () => {
  it('creates a distinct approach platform for every answer gate', () => {
    const platforms = missionCoursePlatforms()

    expect(platforms).toHaveLength(3)
    expect(new Set(platforms.map(([x, , z]) => `${x},${z}`)).size).toBe(3)
    expect(platforms.every(([, y]) => y > -1.3)).toBe(true)
  })
})
