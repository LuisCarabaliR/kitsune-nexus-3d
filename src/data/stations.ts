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
    challenge: {
      question: string
      options: [string, string, string]
      correctOption: number
      explanation: string
    }
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
      challenge: {
        question: '¿Qué propiedad hace que un material parezca emitir luz en una escena 3D?',
        options: ['Emissive', 'Roughness', 'Normal map'],
        correctOption: 0,
        explanation: 'Emissive aporta color propio al material; bloom puede reforzar visualmente ese brillo.',
      },
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
      challenge: {
        question: '¿Qué recurso ayuda a percibir profundidad entre objetos distantes?',
        options: ['Niebla atmosférica', 'Un solo color plano', 'Eliminar la cámara'],
        correctOption: 0,
        explanation: 'La niebla atenúa objetos lejanos y ayuda a crear profundidad visual.',
      },
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
      challenge: {
        question: '¿Cuál par de propiedades define gran parte de un material PBR metálico?',
        options: ['Metalness y roughness', 'Tamaño de texto y opacidad', 'Solo el color de fondo'],
        correctOption: 0,
        explanation: 'Metalness define el carácter metálico y roughness controla la dispersión de los reflejos.',
      },
    },
  },
]

export function getStation(id: string): Station | undefined {
  return stations.find((station) => station.id === id)
}
