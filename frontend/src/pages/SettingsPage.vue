<template>
  <q-page class="bg-surface">
    <!-- Hero padrão -->
    <section class="support-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge"><q-icon name="settings" class="q-mr-xs" />Configurações</div>
          <h1 class="hero-title">Configurações</h1>
          <p class="hero-subtitle">Personalize o tema e as preferências de interface</p>
        </div>
      </div>
    </section>
    <section class="q-py-lg bg-surface">
      <div class="container">
        

        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="filters-section">
              <div class="row items-center q-mb-md">
                <q-icon name="palette" class="q-mr-sm" />
                <div class="text-subtitle1">Tema</div>
              </div>
              <div class="text-caption text-muted q-mb-md">Escolha entre Claro ou Escuro. Aplicação imediata.</div>
              <q-btn-toggle
                :model-value="theme.mode"
                @update:model-value="(v) => setThemeWithUndo(v)"
                toggle-color="primary"
                color="primary"
                unelevated
                rounded
                spread
                :options="[
                  { label: 'Claro', value: 'light', icon: 'light_mode' },
                  { label: 'Escuro', value: 'dark', icon: 'dark_mode' }
                ]"
              />
              <div class="q-mt-md">
                <q-btn flat color="negative" icon="restart_alt" label="Restaurar Padrões" @click="restoreDefaults" />
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="filters-section">
              <div class="row items-center q-mb-md">
                <q-icon name="tune" class="q-mr-sm" />
                <div class="text-subtitle1">Preferências de Interface</div>
              </div>
              <div class="text-caption text-muted q-mb-md">Ajustes de acessibilidade e conforto visual. Aplicação imediata.</div>
              <q-list separator>
                <q-item tag="label" clickable>
                  <q-item-section>
                    <q-item-label>Layout compacto</q-item-label>
                    <q-item-label caption>Reduz margens e espaçamentos para exibir mais conteúdo.</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle :model-value="theme.prefs.compact" @update:model-value="onToggle('compact', $event)" aria-label="Layout compacto" />
                  </q-item-section>
                </q-item>

                <q-item tag="label" clickable>
                  <q-item-section>
                    <q-item-label>Reduzir transparências</q-item-label>
                    <q-item-label caption>Remove efeitos de vidro/fundo translúcido para legibilidade.</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle :model-value="theme.prefs.reduceTransparency" @update:model-value="onToggle('reduceTransparency', $event)" aria-label="Reduzir transparências" />
                  </q-item-section>
                </q-item>

                <q-item tag="label" clickable>
                  <q-item-section>
                    <q-item-label>Alto contraste</q-item-label>
                    <q-item-label caption>Aumenta contraste em estados ativos e foco.</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle :model-value="theme.prefs.highContrast" @update:model-value="onToggle('highContrast', $event)" aria-label="Alto contraste" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
  
</template>

<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme'
import { Notify } from 'quasar'

type ThemeMode = 'light' | 'dark'

const theme = useThemeStore()

function showUndo(message: string, undo: () => void) {
  Notify.create({
    message,
    timeout: 2000,
    position: 'top-right',
    actions: [{ label: 'Desfazer', color: 'white', handler: undo }],
  })
}

function setThemeWithUndo(mode: ThemeMode) {
  if (theme.mode === mode) return
  const prev = theme.mode
  theme.setMode(mode)
  showUndo(`Tema: ${mode === 'dark' ? 'Escuro' : 'Claro'}`, () => theme.setMode(prev))
}

type PrefKey = 'compact' | 'reduceMotion' | 'reduceTransparency' | 'highContrast'
function onToggle(key: PrefKey, value: boolean) {
  const prev = theme.prefs[key]
  theme.setPreferences({ [key]: value })
  const labels: Record<PrefKey, string> = {
    compact: 'Layout compacto',
    reduceMotion: 'Reduzir animações',
    reduceTransparency: 'Reduzir transparências',
    highContrast: 'Alto contraste',
  }
  showUndo(`${labels[key]}: ${value ? 'ativado' : 'desativado'}`, () => theme.setPreferences({ [key]: prev }))
}

function restoreDefaults() {
  const prevMode = theme.mode
  const prevPrefs = { ...theme.prefs }
  theme.setMode('light')
  theme.setPreferences({ compact: false, reduceMotion: false, reduceTransparency: false, highContrast: false })
  showUndo('Padrões restaurados', () => {
    theme.setMode(prevMode)
    theme.setPreferences(prevPrefs)
  })
}
</script>

<style scoped>
.container { max-width: 1120px; margin: 0 auto; padding: 0 32px; }

/* Hero padrão */
.support-hero { 
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%);
  color: #fff;
  padding: 56px 0 44px;
}
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 14px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0; }
[data-theme='dark'] .support-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }

.settings-card { overflow: hidden; }
.theme-option {
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}
.theme-option.is-selected { border-color: var(--color-text-muted); box-shadow: 0 0 0 2px rgba(30,64,175,.2); }
.theme-option:hover { transform: translateY(-2px); }
.theme-preview { height: 110px; display: grid; grid-template-rows: 28px 1fr; }
.theme-preview--light { background: #ffffff; }
.theme-preview--light::before { content: ''; display: block; background: #e2e8f0; }
.theme-preview--dark { background: #0b1220; }
.theme-preview--dark::before { content: ''; display: block; background: #0f172a; }
</style>


