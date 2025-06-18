import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    // plugins: [externalizeDeps()]
  },
  preload: {
    // plugins: [externalizeDeps()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/'),
      }
    },
    plugins: [react()]
  }
})
