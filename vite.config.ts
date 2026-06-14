import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          'date-fns': ['date-fns'],
        },
      },
    },
  },
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart: (options) => {
          void options.startup()
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                entryFileNames: '[name].mjs',
                format: 'es',
              },
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart: (options) => {
          void options.reload()
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                entryFileNames: '[name].cjs',
                format: 'cjs',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
})
