import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  main: {
    // plugins: [externalizeDeps()]
  },
  preload: {
    // plugins: [externalizeDeps()]
  },
  renderer: {
    css: {
      postcss: {
        plugins: [
          tailwindcss({ config: './tailwind.config.js' }),
          autoprefixer(),
        ],
      },
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/'),
      }
    },
    plugins: [react()]
  }
})
