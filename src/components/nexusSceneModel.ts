import type { Station } from '../data/stations'

export function portalPositions(stations: Station[]): [number, number, number][] {
  return stations.map((station) => station.theme.position)
}
