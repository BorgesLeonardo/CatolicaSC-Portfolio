import { defineStore } from 'pinia'
import { Dark, LocalStorage } from 'quasar'

type ThemeMode = 'light' | 'dark'

interface UiPreferencesState {
  compact: boolean
  reduceTransparency: boolean
  highContrast: boolean
}

interface ThemeState {
  mode: ThemeMode
  prefs: UiPreferencesState
}

const STORAGE_KEY_MODE = 'ui.theme.mode'
const STORAGE_KEY_PREFS = 'ui.prefs'

function applyQuasarDark(mode: ThemeMode): void {
  Dark.set(mode === 'dark')
}

function applyDomAttributes(isDark: boolean, prefs: UiPreferencesState): void {
  const root = document.documentElement
  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  root.setAttribute('data-compact', String(prefs.compact))
  root.setAttribute('data-reduce-transparency', String(prefs.reduceTransparency))
  root.setAttribute('data-high-contrast', String(prefs.highContrast))
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: ((): ThemeMode => {
      const stored = LocalStorage.getItem<ThemeMode | 'auto'>(STORAGE_KEY_MODE)
      return stored === 'dark' ? 'dark' : 'light'
    })(),
    prefs: ((): UiPreferencesState => {
      const stored = LocalStorage.getItem<UiPreferencesState>(STORAGE_KEY_PREFS)
      // Backward compatibility: ignore reduceMotion if stored
      const defaults: UiPreferencesState = { compact: false, reduceTransparency: false, highContrast: false }
      return stored ? { ...defaults, ...stored } as UiPreferencesState : defaults
    })(),
  }),
  getters: {
    isDark(state): boolean {
      return state.mode === 'dark'
    },
  },
  actions: {
    init(): void {
      applyQuasarDark(this.mode)
      applyDomAttributes(this.isDark, this.prefs)
    },
    setMode(mode: ThemeMode): void {
      this.mode = mode
      LocalStorage.set(STORAGE_KEY_MODE, mode)
      applyQuasarDark(mode)
      applyDomAttributes(this.isDark, this.prefs)
    },
    toggle(): void {
      // cycle between light and dark only
      this.setMode(this.mode === 'light' ? 'dark' : 'light')
    },
    setPreferences(prefs: Partial<UiPreferencesState>): void {
      this.prefs = { ...this.prefs, ...prefs }
      LocalStorage.set(STORAGE_KEY_PREFS, this.prefs)
      applyDomAttributes(this.isDark, this.prefs)
    },
    setCompact(value: boolean): void {
      this.setPreferences({ compact: value })
    },
    setReduceTransparency(value: boolean): void {
      this.setPreferences({ reduceTransparency: value })
    },
    setHighContrast(value: boolean): void {
      this.setPreferences({ highContrast: value })
    },
  },
})


