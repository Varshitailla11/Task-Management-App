import react from '@vitejs/plugin-react'
import vite from 'vite'

const { defineConfig } = vite

export default defineConfig({
  plugins: [react()],
})