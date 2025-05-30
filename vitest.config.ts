// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    pool: 'vmThreads',
    poolOptions: {
      vmThreads: {
        useAtomics: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        'src/types/',
        'src/main.tsx',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '**/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      include: ['src/**/*.{ts,tsx}'],
      all: true,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    outputFile: {
      json: './test-results.json',
      junit: './junit.xml',
    },
    isolate: true,
  },
})
