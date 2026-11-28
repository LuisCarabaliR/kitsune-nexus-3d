import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./components/NexusScene', () => ({
  NexusScene: ({ onSelect, onActivateCore, onReturnToNexus, onMissionAnswer, onActivateRelic }: { onSelect: (id: string) => void, onActivateCore?: (id: 'mecha') => void, onReturnToNexus?: () => void, onMissionAnswer?: (option: number) => void, onActivateRelic?: (id: number) => void }) => (
    <div>
      <button type="button" onClick={() => onSelect('mecha')}>Escena del Nexus</button>
      <button type="button" onClick={() => onActivateCore?.('mecha')}>Activar núcleo desde escena</button>
      <button type="button" onClick={() => onReturnToNexus?.()}>Portal de regreso 3D</button>
      <button type="button" onClick={() => onMissionAnswer?.(1)}>Puerta de respuesta errónea</button>
      <button type="button" onClick={() => onActivateRelic?.(0)}>Fragmento de escena 1</button>
      <button type="button" onClick={() => onActivateRelic?.(1)}>Fragmento de escena 2</button>
      <button type="button" onClick={() => onActivateRelic?.(2)}>Fragmento de escena 3</button>
    </div>
  ),
}))

import App from './App'

describe('App', () => {
  it('unlocks and completes the final challenge using the exterior core shortcuts', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Activar núcleo de Ciudad Neón/i }))
    fireEvent.click(screen.getByRole('button', { name: /Activar núcleo de Santuario del Viento/i }))
    fireEvent.click(screen.getByRole('button', { name: /Activar núcleo de Hangar Mecha/i }))
    fireEvent.click(screen.getByRole('button', { name: /1 · Ciudad Neón/i }))
    fireEvent.click(screen.getByRole('button', { name: /3 · Hangar Mecha/i }))
    fireEvent.click(screen.getByRole('button', { name: /2 · Santuario del Viento/i }))
    fireEvent.click(screen.getByRole('button', { name: /1 · Ciudad Neón/i }))
    expect(screen.getByText(/Lumi sincronizó el núcleo central/i)).toBeInTheDocument()
  })
  it('shows the three station names and a selected station panel', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /^Ciudad Neón Metrópolis de luz$/i })).toBeInTheDocument()
    expect(screen.getByText('Santuario del Viento')).toBeInTheDocument()
    expect(screen.getByText('Hangar Mecha')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ciudad Neón' })).toBeInTheDocument()
  })

  it('enters the selected room and returns to the Nexus', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Activar núcleo de Ciudad Neón/i }))
    fireEvent.click(screen.getByRole('button', { name: /Entrar a Ciudad Neón/i }))
    expect(screen.getByRole('heading', { name: /Sala: Ciudad Neón/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver al Nexus/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Volver al Nexus/i }))
    expect(screen.getByRole('button', { name: /Entrar a Ciudad Neón/i })).toBeInTheDocument()
  })

  it('shows the explorer profile with skills and project links', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /Archivo del Explorador/i })).toBeInTheDocument()
    expect(screen.getByText(/Luis Carabalí Rivera/i)).toBeInTheDocument()
    expect(screen.getByText(/Backend & Fullstack/i)).toBeInTheDocument()
    expect(screen.queryByText(/WhatsApp/i)).not.toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver repositorio/i })).toHaveAttribute('href', expect.stringContaining('github.com'))
  })

  it('shows mission progress and unlocks a portal after its core is activated', () => {
    render(<App />)

    expect(screen.getByText(/Núcleos estabilizados: 0\/3/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Activar núcleo de Ciudad Neón/i }))
    expect(screen.getByText(/Núcleos estabilizados: 1\/3/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar a Ciudad Neón/i })).toBeEnabled()
  })

  it('passes mission state and the activation callback to the 3D scene', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Activar núcleo desde escena/i }))
    expect(screen.getByText(/Núcleos estabilizados: 1\/3/i)).toBeInTheDocument()
  })

  it('enters any portal directly from the Nexus scene without activating its core', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Escena del Nexus/i }))
    expect(screen.getByRole('heading', { name: /Sala: Hangar Mecha/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Activar misión 3D/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver al Nexus/i })).toBeInTheDocument()
  })

  it('returns to the Nexus from the 3D return portal', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Escena del Nexus/i }))
    expect(screen.getByRole('heading', { name: /Sala: Hangar Mecha/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Portal de regreso 3D/i }))

    expect(screen.getByRole('button', { name: /Entrar a Hangar Mecha/i })).toBeInTheDocument()
  })

  it('turns two wrong mission answers into a visible void failure', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Escena del Nexus/i }))
    fireEvent.click(screen.getByRole('button', { name: /Activar misión 3D/i }))
    fireEvent.click(screen.getByRole('button', { name: /Fragmento de escena 1/i }))
    fireEvent.click(screen.getByRole('button', { name: /Fragmento de escena 2/i }))
    fireEvent.click(screen.getByRole('button', { name: /Fragmento de escena 3/i }))
    fireEvent.click(screen.getByRole('button', { name: /Puerta de respuesta errónea/i }))
    expect(screen.getByText(/Fallas de estabilidad: 1\/2/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Puerta de respuesta errónea/i }))

    expect(screen.getByText(/Misión perdida · Lumi cayó en la grieta dimensional/i)).toBeInTheDocument()
  })
})
