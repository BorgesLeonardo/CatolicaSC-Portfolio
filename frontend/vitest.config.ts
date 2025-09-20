import { defineConfig } from 'vitest/config'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/quasar-variables.sass'
    })
  ],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{ts,vue,js}',
        'src/components/**/*',
        'src/pages/**/*',
        'src/services/**/*',
        'src/utils/**/*',
        'src/composables/**/*'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'src/test/**',
        'src/boot/**',
        'src/main.ts',
        'src/router/index.ts'
      ],
      all: true,
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60
        }
      }
    },
    globals: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
