import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/kitsune-nexus-3d/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
