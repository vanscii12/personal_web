import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '.',
  publicDir: 'public',
  // Footprint's tile workers import modules (apps/footprint/src/worker/).
  worker: { format: 'es' },
  build: {
    outDir: 'dist',
    // MapLibre is large by nature; it sits in its own chunk, loaded only by /apps/footprint.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  },
  server: {
    port: 3000,
    open: false
  }
})
