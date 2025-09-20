import { config } from '@vue/test-utils'

// Mock Quasar components and plugins
config.global.mocks = {
  $q: {
    platform: {
      is: {
        electron: false,
        cordova: false,
        capacitor: false,
        bex: false,
        ssr: false,
        chrome: true,
        firefox: false,
        safari: false,
        edge: false,
        opera: false,
        mobile: false,
        android: false,
        ios: false,
        win: false,
        mac: false,
        linux: false,
        desktop: false
      }
    },
    dark: {
      isActive: false
    }
  }
}

// Mock global properties
config.global.plugins = []
config.global.stubs = {
  'q-page': true,
  'q-layout': true,
  'q-page-container': true,
  'q-btn': true,
  'q-card': true,
  'q-card-section': true,
  'q-card-actions': true,
  'q-input': true,
  'q-select': true,
  'q-form': true,
  'q-space': true,
  'q-icon': true,
  'q-spinner': true,
  'q-banner': true,
  'q-dialog': true,
  'q-separator': true,
  'q-list': true,
  'q-item': true,
  'q-item-section': true,
  'q-item-label': true,
  'q-avatar': true,
  'q-img': true,
  'q-badge': true,
  'q-chip': true,
  'q-linear-progress': true,
  'q-circular-progress': true,
  'q-toolbar': true,
  'q-toolbar-title': true,
  'q-drawer': true,
  'q-header': true,
  'q-footer': true,
  'q-layout-drawer': true,
  'q-layout-header': true,
  'q-layout-footer': true,
  'router-link': true,
  'router-view': true
}
