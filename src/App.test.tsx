import { render, screen } from '@testing-library/react'
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
})
