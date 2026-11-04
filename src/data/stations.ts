export type StationTheme = {
  primary: string
  secondary: string
  position: [number, number, number]
}

export type Station = {
  id: 'neon' | 'wind' | 'mecha'
  name: string
  subtitle: string
  description: string
  theme: StationTheme
}

export const stations: Station[] = [
  {
    id: 'neon',
    name: 'Ciudad Neón',
    subtitle: 'Metrópolis de luz',
    description: 'Explora contraste, emisivos y composición en una ciudad futurista.',
    theme: { primary: '#f725d0', secondary: '#28d8ff', position: [-4.2, 0, -0.4] },
  },
  {
    id: 'wind',
    name: 'Santuario del Viento',
    subtitle: 'Arquitectura suspendida',
    description: 'Observa capas, atmósfera y movimiento dentro de un santuario orbital.',
    theme: { primary: '#8c5cff', secondary: '#66ffd8', position: [0, 0.5, -1.4] },
  },
  {
    id: 'mecha',
    name: 'Hangar Mecha',
    subtitle: 'Materia y metal',
    description: 'Descubre superficies PBR, metalness y la escala de una nave mecánica.',
    theme: { primary: '#ff8a3d', secondary: '#ffe066', position: [4.2, 0, -0.4] },
  },
]

export function getStation(id: string): Station | undefined {
  return stations.find((station) => station.id === id)
}
