import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          include: ['src/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
})
