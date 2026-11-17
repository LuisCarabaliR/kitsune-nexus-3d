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
  room: {
    mission: string
    learningPoints: [string, string, string]
  }
}

export const stations: Station[] = [
  {
    id: 'neon',
    name: 'Ciudad Neón',
    subtitle: 'Metrópolis de luz',
    description: 'Explora contraste, emisivos y composición en una ciudad futurista.',
    theme: { primary: '#f725d0', secondary: '#28d8ff', position: [-4.2, 0, -0.4] },
    room: {
      mission: 'Estabiliza la avenida lumínica y equilibra sus emisivos.',
      learningPoints: ['Contraste neón', 'Emisivos y bloom', 'Composición urbana'],
    },
  },
  {
    id: 'wind',
    name: 'Santuario del Viento',
    subtitle: 'Arquitectura suspendida',
    description: 'Observa capas, atmósfera y movimiento dentro de un santuario orbital.',
    theme: { primary: '#8c5cff', secondary: '#66ffd8', position: [0, 0.5, -1.4] },
    room: {
      mission: 'Activa los anillos suspendidos y descubre sus capas atmosféricas.',
      learningPoints: ['Profundidad aérea', 'Capas orbitales', 'Movimiento ambiental'],
    },
  },
  {
    id: 'mecha',
    name: 'Hangar Mecha',
    subtitle: 'Materia y metal',
    description: 'Descubre superficies PBR, metalness y la escala de una nave mecánica.',
    theme: { primary: '#ff8a3d', secondary: '#ffe066', position: [4.2, 0, -0.4] },
    room: {
      mission: 'Sincroniza el núcleo mecha para revelar sus materiales metálicos.',
      learningPoints: ['Metalness', 'Rugosidad PBR', 'Escala mecánica'],
    },
  },
]

export function getStation(id: string): Station | undefined {
  return stations.find((station) => station.id === id)
}
