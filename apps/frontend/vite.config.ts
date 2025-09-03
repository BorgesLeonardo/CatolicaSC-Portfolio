import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const r = (p: string) => resolve(__dirname, p)

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: r('src/quasar-variables.sass') })
  ],
  css: {
    preprocessorOptions: {
      sass: {
        loadPaths: [r('.')] // ajuda o sass a resolver 'src/...'
      }
    }
  },
  server: { port: 5173, host: '0.0.0.0' }
})
