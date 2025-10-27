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
      // We'll enforce thresholds in CI via Sonar; keep local thresholds relaxed
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
      // Only include files we meaningfully test to avoid counting all pages/layouts
      all: true,
      include: [
        'src/utils/**/*.ts',
        'src/services/**/*.ts',
        // targeted components with unit tests
        'src/components/AnimatedNumber.vue',
        'src/components/EssentialLink.vue',
      ],
      exclude: [
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/main.ts',
        'src/App.vue',
        'src/pages/**',
        'src/layouts/**',
        'src/router/**',
        'src/stores/**',
        'src/boot/**',
        'src/config/**',
        '**/*.d.ts',
      ],
    },
  },
})


