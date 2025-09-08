import { defineConfig } from '#q-app/wrappers'

export default defineConfig((/* ctx */) => {
  return {
  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-eslint
  eslint: {
    // fix: true,
    // include = [],
    // exclude = [],
    // rawOptions = {},
    warnings: true,
    errors: true
  },

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-boot
  boot: [
    'clerk',
    'axios'
  ],

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-css
  css: [
    'app.scss'
  ],

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-extras
  extras: [
    'roboto-font',
    'material-icons'
  ],

  // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-build
  build: {
    target: {
      browser: [ 'es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1' ],
      node: 'node16'
    },

    vueRouterMode: 'history', // available values: 'hash', 'history'
    // vueRouterBase,
    // vueDevtools,
    // vueOptionsAPI: false,

    // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

    // publicPath: '/',
    // analyze: true,
    // env: {},
    // rawDefine: {}
    // rawOptions: {},
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-devServer
  devServer: {
    // https: true
    open: true // opens browser window automatically
  },

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-framework
  framework: {
    config: {},

    // iconSet: 'material-icons', // Quasar icon set
    // lang: 'en-US', // Quasar language pack

    // For special cases outside of where the auto-import strategy can have an impact
    // (like functional components as one of the examples),
    // you can manually specify Quasar components/directives to be available everywhere:
    //
    // components: [],
    // directives: [],

    // Quasar plugins
    plugins: []
  },

  // animations: 'all', // --- includes all animations
  // https://v2.quasar.dev/options/animations
  animations: [],

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
  // sourceFiles: {
  //   rootComponent: 'src/App.vue',
  //   router: 'src/router',
  //   store: 'src/store',
  //   registerServiceWorker: 'src-pwa/register-service-worker',
  //   serviceWorker: 'src-pwa/custom-service-worker',
  //   pwaManifestFile: 'src-pwa/manifest.json',
  //   electronMain: 'src-electron/electron-main',
  //   electronPreload: 'src-electron/electron-preload'
  // },

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-htmlfilename
  htmlFilename: 'index.html',

  // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sgc
  // sgc: {
  //   tool: 'eslint', // or 'prettier'
  //   config: {},
  //   component: true,
  //   directive: true,
  //   filter: true,
  //   composable: true,
  //   boot: true,
  //   route: true
  // }
  }
})
