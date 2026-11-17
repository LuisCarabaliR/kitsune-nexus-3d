import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./components/NexusScene', () => ({
  NexusScene: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <button type="button" onClick={() => onSelect('mecha')}>
      Escena del Nexus
    </button>
  ),
}))

import App from './App'

describe('App', () => {
  it('shows the three station names and a selected station panel', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /Ciudad Neón/i })).toBeInTheDocument()
    expect(screen.getByText('Santuario del Viento')).toBeInTheDocument()
    expect(screen.getByText('Hangar Mecha')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ciudad Neón' })).toBeInTheDocument()
  })

  it('enters the selected room and returns to the Nexus', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Entrar a la sala/i }))
    expect(screen.getByRole('heading', { name: /Sala: Ciudad Neón/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver al Nexus/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Volver al Nexus/i }))
    expect(screen.getByRole('button', { name: /Entrar a la sala/i })).toBeInTheDocument()
  })

  it('shows the explorer profile with skills and project links', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /Archivo del Explorador/i })).toBeInTheDocument()
    expect(screen.getByText(/Luis CarabaliR/i)).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver repositorio/i })).toHaveAttribute('href', expect.stringContaining('github.com'))
  })
})
