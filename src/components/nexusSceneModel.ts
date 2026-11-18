import type { Station } from '../data/stations'

export function portalPositions(stations: Station[]): [number, number, number][] {
  return stations.map((station) => station.theme.position)
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
