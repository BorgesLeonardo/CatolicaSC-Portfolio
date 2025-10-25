import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage-unit',
      thresholds: {
        lines: 25,
        functions: 25,
        branches: 25,
        statements: 25,
      },
      all: true,
      include: ['src/utils/**/*.{ts,vue}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/main.ts',
        'src/router/**',
        'src/boot/**',
        'src/stores/**',
        '**/*.d.ts',
      ],
    },
  },
})


