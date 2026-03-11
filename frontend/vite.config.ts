import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 8080,
    allowedHosts: ['perceptive-education-production.up.railway.app']
  },
  server: {
    host: true,
    port: 5173
  }
})