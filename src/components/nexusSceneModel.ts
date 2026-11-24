import type { Station } from '../data/stations'

export function portalPositions(stations: Station[]): [number, number, number][] {
  return stations.map((station) => station.theme.position)
}

export function minimumPortalSeparation(stations: Station[]): number {
  if (stations.length < 2) return 0

  let closest = Number.POSITIVE_INFINITY
  for (let first = 0; first < stations.length; first += 1) {
    for (let second = first + 1; second < stations.length; second += 1) {
      const [firstX, , firstZ] = stations[first].theme.position
      const [secondX, , secondZ] = stations[second].theme.position
      closest = Math.min(closest, Math.hypot(firstX - secondX, firstZ - secondZ))
    }
  }

  return closest
}

export function portalAtPosition(
  position: [number, number, number],
  stations: Station[],
  activationRadius = 1.28,
): Station['id'] | undefined {
  return stations.find((station) => {
    const [portalX, , portalZ] = station.theme.position
    return Math.hypot(position[0] - portalX, position[2] - portalZ) <= activationRadius
  })?.id
}
