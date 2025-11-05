<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Skip to main content for accessibility -->
    <a href="#main-content" class="skip-link sr-only">Pular para o conteúdo principal</a>
    
    <q-header 
      class="modern-toolbar" 
      :class="{ 'scrolled': isScrolled, 'drawer-open': leftDrawerOpen }"
      elevated
    >
      <q-toolbar class="q-px-lg">
        <!-- Dynamic Menu Button -->
        <div class="menu-button-container">
          <q-btn 
            flat 
            dense 
            round 
            aria-label="Abrir menu de navegação" 
            @click="toggleLeftDrawer"
            class="dynamic-menu-btn hover-lift"
            :class="{ 'menu-open': leftDrawerOpen }"
          >
            <div class="hamburger-icon">
              <span class="hamburger-line hamburger-line--top"></span>
              <span class="hamburger-line hamburger-line--middle"></span>
              <span class="hamburger-line hamburger-line--bottom"></span>
            </div>
          </q-btn>
        </div>

        <q-toolbar-title class="q-ml-sm" shrink>
          <q-btn
            flat
            no-caps
            padding="sm md"
            class="brand-menu-btn hover-lift"
            :class="{ 'menu-open': leftDrawerOpen }"
            @click="toggleLeftDrawer"
            aria-label="Abrir menu lateral"
            aria-haspopup="menu"
            :aria-expanded="leftDrawerOpen ? 'true' : 'false'"
            role="button"
          >
            <q-icon name="campaign" size="md" color="primary" class="q-mr-sm" />
            <span class="text-h6 logo-text">Crowdfunding</span>
            <q-badge class="q-ml-sm lt-md" color="primary" align="top">Menu</q-badge>
            <q-tooltip transition-show="fade" transition-hide="fade">Abrir menu lateral</q-tooltip>
          </q-btn>
        </q-toolbar-title>

        <!-- Desktop Navigation -->
        <div class="gt-md desktop-nav toolbar-center">
          <nav class="nav-links">
            <q-btn 
              flat
              :class="{ 'nav-active': isActiveRoute('/') }"
              label="Início" 
              to="/" 
              class="nav-btn hover-lift"
            />
            <q-btn 
              flat
              :class="{ 'nav-active': isActiveRoute('/projects') }"
              label="Campanhas" 
              to="/projects" 
              class="nav-btn hover-lift"
            />
            <q-btn 
              flat
              label="Como Funciona" 
              class="nav-btn hover-lift"
              @click="scrollToHowItWorks"
            />
          </nav>
        </div>
        <div class="toolbar-right">
          <!-- Theme Toggle -->
          <q-btn
            v-if="false"
            outline
            round
            dense
            :icon="themeIcon"
            :aria-label="`Alternar tema (atual: ${themeLabel})`"
            aria-haspopup="menu"
            :aria-expanded="false"
            @click="toggleTheme"
            color="primary"
            class="q-mr-sm hover-lift theme-toggle-btn"
          >
            <q-tooltip transition-show="fade" transition-hide="fade">
              Tema: {{ themeLabel }}. Clique para alternar. Botão direito/toque longo para escolher.
            </q-tooltip>
            <q-menu context-menu touch-position>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup @click="setThemeMode('light')">
                  <q-item-section avatar>
                    <q-icon name="light_mode" />
                  </q-item-section>
                  <q-item-section>Claro</q-item-section>
                  <q-item-section side>
                    <q-icon name="check" v-if="theme.mode === 'light'" />
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="setThemeMode('dark')">
                  <q-item-section avatar>
                    <q-icon name="dark_mode" />
                  </q-item-section>
                  <q-item-section>Escuro</q-item-section>
                  <q-item-section side>
                    <q-icon name="check" v-if="theme.mode === 'dark'" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Auth Buttons -->
          <div class="auth-section q-gutter-sm row items-center">
            <SignedOut>
              <q-btn 
                flat 
                label="Entrar" 
                to="/sign-in" 
                class="auth-btn auth-btn--secondary hover-lift"
              />
              <q-btn 
                unelevated
                label="Cadastrar" 
                to="/sign-up"
                color="primary"
                class="auth-btn auth-btn--primary hover-lift"
              />
            </SignedOut>
            <SignedIn>
              <!-- Quick actions ocultadas na barra superior -->
              <template v-if="false">
                <q-btn 
                  flat 
                  icon="add" 
                  label="Nova Campanha" 
                  to="/projects/new"
                  color="primary"
                  class="action-btn action-btn--create gt-sm hover-lift"
                />
                <q-btn 
                  flat 
                  icon="campaign" 
                  label="Minhas Campanhas" 
                  to="/me"
                  class="action-btn action-btn--campaigns gt-sm hover-lift"
                />
                <q-btn 
                  flat 
                  icon="dashboard" 
                  label="Dashboard" 
                  to="/dashboard"
                  class="action-btn action-btn--dashboard gt-sm hover-lift"
                />
              </template>
              <div class="user-menu">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer 
      v-model="leftDrawerOpen" 
      show-if-above 
      bordered
      class="modern-drawer"
      :width="320"
      overlay
    >
      <div class="drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div 
            class="drawer-logo"
            role="button"
            tabindex="0"
            aria-label="Ocultar menu"
            @click="leftDrawerOpen = false"
            @keydown.enter="leftDrawerOpen = false"
            @keydown.space.prevent="leftDrawerOpen = false"
          >
            <q-icon name="campaign" size="lg" color="primary" />
            <span class="drawer-title">Crowdfunding</span>
            <q-tooltip transition-show="fade" transition-hide="fade">Ocultar menu lateral</q-tooltip>
          </div>
          <q-btn 
            flat 
            dense 
            round 
            icon="close" 
            class="lt-lg drawer-close"
            @click="leftDrawerOpen = false"
            aria-label="Fechar menu"
          />
        </div>

        <!-- Navigation List -->
        <q-list class="navigation-list">
          <q-item-label header class="nav-header">
            <q-icon name="explore" size="sm" class="q-mr-xs" />
            Navegação
          </q-item-label>
          
          <q-item 
            clickable 
            v-ripple 
            to="/"
            class="nav-item"
            active-class="nav-item--active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="nav-label">Início</q-item-label>
              <q-item-label caption class="nav-caption">Página inicial</q-item-label>
            </q-item-section>
          </q-item>

          <q-item 
            clickable 
            v-ripple 
            to="/projects"
            class="nav-item"
            active-class="nav-item--active"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon name="campaign" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="nav-label">Campanhas</q-item-label>
              <q-item-label caption class="nav-caption">Explorar projetos</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item 
            clickable 
            v-ripple 
            class="nav-item"
            @click="scrollToHowItWorks"
          >
            <q-item-section avatar>
              <q-icon name="help_outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="nav-label">Como Funciona</q-item-label>
              <q-item-label caption class="nav-caption">Saiba mais</q-item-label>
            </q-item-section>
          </q-item>

          <SignedIn>
            <q-separator class="nav-separator" />
            <q-item-label header class="nav-header">
              <q-icon name="person" size="sm" class="q-mr-xs" />
              Minha Conta
            </q-item-label>

            <q-item 
              clickable 
              v-ripple 
              to="/projects/new"
              class="nav-item nav-item--highlighted"
              active-class="nav-item--active"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="add_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">Nova Campanha</q-item-label>
                <q-item-label caption class="nav-caption">Criar projeto</q-item-label>
              </q-item-section>
            </q-item>

            <q-item 
              clickable 
              v-ripple 
              to="/me"
              class="nav-item"
              active-class="nav-item--active"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="campaign" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">Minhas Campanhas</q-item-label>
                <q-item-label caption class="nav-caption">Meus projetos</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              v-ripple 
              to="/favorites"
              class="nav-item"
              active-class="nav-item--active"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="favorite" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">Favoritos</q-item-label>
                <q-item-label caption class="nav-caption">Campanhas salvas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item 
              clickable 
              v-ripple 
              to="/dashboard"
              class="nav-item"
              active-class="nav-item--active"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">Dashboard</q-item-label>
                <q-item-label caption class="nav-caption">Painel administrativo</q-item-label>
              </q-item-section>
            </q-item>

            <q-item 
              clickable 
              v-ripple 
              to="/subscriptions"
              class="nav-item"
              active-class="nav-item--active"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="autorenew" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">Assinaturas</q-item-label>
                <q-item-label caption class="nav-caption">Gerenciar assinaturas</q-item-label>
              </q-item-section>
            </q-item>
          </SignedIn>

          <!-- Settings section (after Minha Conta) -->
          <q-separator class="nav-separator" />
          <q-item-label header class="nav-header">
            <q-icon name="settings" size="sm" class="q-mr-xs" />
            Configurações
          </q-item-label>
          <q-item clickable v-ripple to="/settings" class="nav-item" active-class="nav-item--active" @click="leftDrawerOpen = false">
            <q-item-section avatar>
              <q-icon name="tune" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="nav-label">Preferências</q-item-label>
              <q-item-label caption class="nav-caption">Tema e interface</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Drawer CTA -->
        <SignedOut>
          <div class="drawer-cta">
            <div class="cta-content">
              <h4 class="cta-title">Pronto para começar?</h4>
              <p class="cta-description">Crie sua primeira campanha e transforme suas ideias em realidade.</p>
              <q-btn 
                unelevated
                color="primary" 
                label="Começar Agora"
                to="/sign-up"
                class="cta-button"
                @click="leftDrawerOpen = false"
              />
            </div>
          </div>
        </SignedOut>
        
        <!-- Drawer Footer -->
        <div class="drawer-footer">
          <div class="footer-links">
            <q-btn flat size="sm" label="Termos" class="footer-link" />
            <q-btn flat size="sm" label="Privacidade" class="footer-link" />
            <q-btn 
              flat 
              size="sm" 
              label="Suporte" 
              class="footer-link" 
              to="/help" 
              @click="leftDrawerOpen = false" 
            />
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="page-container">
      <!-- Breadcrumb Navigation -->
      <DynamicBreadcrumb v-if="showBreadcrumb" />
      
      <main id="main-content" role="main">
        <router-view />
      </main>
      <ModernFooter />
    </q-page-container>

    <!-- Preferences Dialog removed; now a dedicated page (/settings) -->
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/vue'
import { useRoute, useRouter } from 'vue-router'
import ModernFooter from 'src/components/ModernFooter.vue'
import DynamicBreadcrumb from 'src/components/DynamicBreadcrumb.vue'
import { useThemeStore } from 'src/stores/theme'
import { Notify } from 'quasar'
import { useFavoritesStore } from 'src/stores/favorites'
import { clearTempAuthRedirectCookie } from 'src/utils/http'

const route = useRoute()
const router = useRouter()
const leftDrawerOpen = ref(false)
const isScrolled = ref(false)
const theme = useThemeStore()
const favorites = useFavoritesStore()
const { isSignedIn, user } = useUser()

// Show breadcrumb on pages other than home
const showBreadcrumb = computed(() => {
  return route.path !== '/'
})

// Scroll detection for header styling
function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

// Navigation helpers
function isActiveRoute(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
  
  // Add haptic feedback on supported devices
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
  
  // Add visual feedback with a subtle animation
  const menuBtn = document.querySelector('.dynamic-menu-btn')
  if (menuBtn) {
    menuBtn.classList.add('menu-clicked')
    setTimeout(() => {
      menuBtn.classList.remove('menu-clicked')
    }, 200)
  }
}

// Fallback: when app is using hash router but Stripe returns without '#/connect/...'
// the server serves '/' and SPA lands on Home. Detect URL path and route accordingly.
function handleConnectReturnFallback(): void {
  const path = window.location.pathname || ''
  const search = window.location.search || ''
  if (path.startsWith('/connect/return') && router.currentRoute.value.path !== '/connect/return') {
    void router.replace('/connect/return' + search)
    return
  }
  if (path.startsWith('/connect/refresh') && router.currentRoute.value.path !== '/connect/refresh') {
    void router.replace('/connect/refresh' + search)
    return
  }
  // Also handle checkout/subscription return URLs when app uses hash router
  if (path.startsWith('/contrib/success') && router.currentRoute.value.path !== '/contrib/success') {
    void router.replace('/contrib/success' + search)
    return
  }
  if (path.startsWith('/contrib/cancel') && router.currentRoute.value.path !== '/contrib/cancel') {
    void router.replace('/contrib/cancel' + search)
    return
  }
  if (path.startsWith('/subscribe/success') && router.currentRoute.value.path !== '/subscribe/success') {
    void router.replace('/subscribe/success' + search)
    return
  }
  if (path.startsWith('/subscribe/cancel') && router.currentRoute.value.path !== '/subscribe/cancel') {
    void router.replace('/subscribe/cancel' + search)
  }
}

function scrollToHowItWorks() {
  leftDrawerOpen.value = false
  
  // If not on home page, navigate to home first
  if (route.path !== '/') {
    void router.push('/').then(() => {
      setTimeout(() => {
        const element = document.querySelector('.how-it-works-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    })
  } else {
    const element = document.querySelector('.how-it-works-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

onMounted(() => {
  favorites.setUser(user.value?.id ?? null)
  // Se usuário já está logado ao montar o layout, limpa supressão/flags
  try {
    sessionStorage.removeItem('auth_redirect_ts')
    sessionStorage.removeItem('auth_redirect_path')
    clearTempAuthRedirectCookie()
  } catch {}
})


watch([isSignedIn, user], ([signed]) => {
  favorites.setUser(user.value?.id ?? null)
  if (signed) {
    try {
      sessionStorage.removeItem('auth_redirect_ts')
      sessionStorage.removeItem('auth_redirect_path')
      clearTempAuthRedirectCookie()
    } catch {}
  }
})

// Theme controls
const themeIcon = computed(() => {
  return theme.isDark ? 'dark_mode' : 'light_mode'
})

const themeLabel = computed(() => (theme.isDark ? 'Escuro' : 'Claro'))

type ThemeMode = 'light' | 'dark'

function toggleTheme() {
  theme.toggle()
  Notify.create({ message: `Tema: ${themeLabel.value}`, timeout: 1200, position: 'top-right' })
}

function setThemeMode(mode: ThemeMode) {
  theme.setMode(mode)
  Notify.create({ message: `Tema: ${themeLabel.value}`, timeout: 1200, position: 'top-right' })
}

// preferences dialog removed; dedicated settings page used instead

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onMounted(() => {
  handleConnectReturnFallback()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
// === HEADER STYLES ===
.modern-toolbar {
  transition: all var(--transition-base);
  
  &.scrolled {
    backdrop-filter: blur(25px);
    
    .q-toolbar {
      padding-top: 12px;
      padding-bottom: 12px;
    }
  }
  
  .q-toolbar {
    transition: all var(--transition-base);
    min-height: 70px;
    position: relative; // allow absolute centering of desktop nav
  }
}

// === LOGO STYLES ===
.logo-container {
  transition: transform var(--transition-fast);
  
  &:hover {
    transform: scale(1.1);
  }
}

.logo-text {
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.025em;
}

// Ensure good contrast in dark mode
// === BRAND MENU BUTTON (logo acts as menu trigger) ===
.brand-menu-btn {
  border-radius: 9999px;
  transition: all var(--transition-fast);

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.menu-open {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.35);
  }
}

:deep(.q-dark) .brand-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.06);
}
[data-theme='dark'] .logo-text {
  color: white;
}

// === DYNAMIC MENU BUTTON ===
.menu-button-container {
  display: flex;
  align-items: center;
  margin-right: 12px;
  
  @media (min-width: 1024px) {
    display: none;
  }
}

.dynamic-menu-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: rgba(30, 64, 175, 0.1);
    border-color: rgba(30, 64, 175, 0.3);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  &.menu-clicked {
    animation: menuClick 0.2s ease-out;
  }
  
  &.menu-open {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    animation: menuPulse 2s infinite;
    
    &:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
      animation: none;
    }
  }
}

// Hamburger Icon Animation
.hamburger-icon {
  width: 24px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: #374151;
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  
  &--top {
    transform-origin: top left;
  }
  
  &--middle {
    transform-origin: center;
  }
  
  &--bottom {
    transform-origin: bottom left;
  }
}

// Menu Open Animation
.dynamic-menu-btn.menu-open {
  .hamburger-line {
    background: #ef4444;
    
    &--top {
      transform: translateY(1px) rotate(45deg);
      width: 85%;
    }
    
    &--middle {
      opacity: 0;
      transform: scaleX(0);
    }
    
    &--bottom {
      transform: translateY(-1px) rotate(-45deg);
      width: 85%;
    }
  }
}

// Responsive Visibility
@media (max-width: 1023px) {
  .menu-button-container {
    display: flex;
  }
}

@media (max-width: 768px) {
  .dynamic-menu-btn {
    width: 44px;
    height: 44px;
    border-radius: 10px;
  }
  
  .hamburger-icon {
    width: 20px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .dynamic-menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
  }
  
  .hamburger-icon {
    width: 18px;
    height: 14px;
  }
  
  .hamburger-line {
    height: 2px;
  }
}

// === ANIMATIONS ===
@keyframes menuPulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15), 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15), 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

@keyframes shimmerEffect {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes menuClick {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

// === ACCESSIBILITY IMPROVEMENTS ===
@media (prefers-reduced-motion: reduce) {
  .dynamic-menu-btn,
  .hamburger-line {
    transition: none !important;
    animation: none !important;
  }
  
  .dynamic-menu-btn:hover {
    transform: none !important;
  }
}

// === HIGH CONTRAST MODE ===
@media (prefers-contrast: high) {
  .dynamic-menu-btn {
    border: 2px solid #000;
    background: #fff;
    
    &.menu-open {
      border-color: #ef4444;
      background: #fef2f2;
    }
  }
  
  .hamburger-line {
    background: #000;
    height: 3px;
    
    .dynamic-menu-btn.menu-open & {
      background: #ef4444;
    }
  }
}

// Logo clickable area styling
.q-toolbar-title {
  .cursor-pointer {
    transition: all 0.2s ease;
    border-radius: 8px;
    padding: 4px 8px;
    margin: -4px -8px;
    
    &:hover {
      background: rgba(30, 64, 175, 0.05);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// === NAVIGATION STYLES ===
.desktop-nav {
  margin: 0;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  height: 100%;
  display: flex;
  align-items: center;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  transition: transform var(--transition-base);
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: #64748b;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(30, 64, 175, 0.1);
    color: #1e40af;
  }
  
  &.nav-active {
    background: rgba(30, 64, 175, 0.1) !important;
    color: #1e40af !important;
    font-weight: 700;
  }
}

// === AUTH SECTION ===
.auth-section {
  gap: 8px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  
  @media (max-width: 1200px) {
    gap: 6px;
  }
}

.auth-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 10px;
  padding: 10px 20px;
  transition: all var(--transition-fast);
  
  &--secondary {
    color: #64748b;
    
    &:hover {
      background: rgba(100, 116, 139, 0.1);
      color: #475569;
    }
  }
  
  &--primary {
    box-shadow: 0 2px 4px rgba(30, 64, 175, 0.15);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(30, 64, 175, 0.25);
    }
  }
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all var(--transition-fast);
  display: flex !important;
  align-items: center;
  gap: 6px;
  
  &--create {
    color: #1e40af;
    
    &:hover {
      background: rgba(30, 64, 175, 0.1);
    }
  }
  
  &--campaigns {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #f97316 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    
    &:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #ea580c 100%) !important;
      color: white !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }
    
    // Ensure visibility
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  &--dashboard {
    color: #3b82f6;
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
      color: #1e40af;
    }
  }
}

.user-menu {
  margin-left: 8px;
}

// Theme toggle visibility and contrast
.theme-toggle-btn {
  background: rgba(255,255,255,0.8);
  border-color: rgba(30, 64, 175, 0.35) !important;
  color: #1e40af !important;
  &:hover { background: rgba(255,255,255,1); }
}

[data-theme='dark'] .theme-toggle-btn {
  background: rgba(2,6,23,0.5);
  border-color: rgba(148,163,184,0.5) !important;
  color: #e2e8f0 !important;
  &:hover { background: rgba(2,6,23,0.7); }
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}

// Quando o drawer estiver aberto, empurra a navegação um pouco à direita
/* Removido ajuste de deslocamento ao abrir o drawer para manter a navegação centralizada */

// === DRAWER STYLES ===
.modern-drawer {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(226, 232, 240, 0.5);
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.drawer-header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  background: rgba(255, 255, 255, 0.5);
}

.drawer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: 10px;
  padding: 6px 8px;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover {
    background: rgba(30, 64, 175, 0.06);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.025em;
}

[data-theme='dark'] .drawer-title {
  color: white;
}

.drawer-close {
  color: #64748b;
  
  &:hover {
    background: rgba(100, 116, 139, 0.1);
    color: #475569;
  }
}

// === NAVIGATION LIST ===
.navigation-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.nav-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

.nav-item {
  border-radius: 12px;
  margin-bottom: 4px;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(30, 64, 175, 0.08);
    transform: translateX(4px);
  }
  
  &--active {
    background: linear-gradient(135deg, rgba(30, 64, 175, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border-left: 3px solid #1e40af;
    
    .nav-label {
      color: #1e40af;
      font-weight: 700;
    }
    
    .q-icon {
      color: #1e40af;
    }
  }
  
  &--highlighted {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #f97316 100%) !important;
    border: none !important;
    color: white !important;
    
    &:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #ea580c 100%) !important;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }
    
    .nav-label {
      color: white !important;
      font-weight: 600;
    }
    
    .nav-caption {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .q-icon {
      color: white !important;
    }
  }
}

.nav-label {
  font-weight: 600;
  color: #334155;
  font-size: 0.925rem;
}

.nav-caption {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
}

.nav-separator {
  margin: 16px 0;
  background: rgba(226, 232, 240, 0.7);
}

// === DRAWER CTA ===
.drawer-cta {
  padding: 24px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}

.cta-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.cta-button {
  width: 100%;
  font-weight: 600;
  border-radius: 10px;
  padding: 12px 24px;
  box-shadow: 0 2px 4px rgba(91, 33, 182, 0.2);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: 0 4px 8px rgba(91, 33, 182, 0.3);
    transform: translateY(-1px);
  }
}

// === DRAWER FOOTER ===
.drawer-footer {
  padding: 16px 24px;
  background: rgba(248, 250, 252, 0.5);
}

.footer-links {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.footer-link {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: none;
  
  &:hover {
    color: #64748b;
  }
}

// === PAGE CONTAINER ===
.page-container {
  background: var(--gradient-subtle);
  min-height: calc(100vh - 70px);
}

// Dark specific tweaks
[data-theme='dark'] .nav-btn {
  color: #94a3b8;

  &:hover {
    background: rgba(148, 163, 184, 0.08);
    color: #e2e8f0;
  }
  &.nav-active {
    background: rgba(148, 163, 184, 0.12) !important;
    color: #e2e8f0 !important;
  }
}

[data-theme='dark'] .modern-drawer {
  background: linear-gradient(135deg, rgba(2, 6, 23, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.12);
}

[data-theme='dark'] .drawer-header {
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.5);
}

[data-theme='dark'] .drawer-close {
  color: #94a3b8;
}

[data-theme='dark'] .nav-header {
  color: #94a3b8;
}

[data-theme='dark'] .nav-item:hover {
  background: rgba(148, 163, 184, 0.08);
}

[data-theme='dark'] .nav-item--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(30, 64, 175, 0.12) 100%);
  border-left-color: #60a5fa;
}

[data-theme='dark'] .nav-label { color: #e2e8f0; }
[data-theme='dark'] .nav-caption { color: #94a3b8; }

[data-theme='dark'] .drawer-cta {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(30, 64, 175, 0.06) 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

[data-theme='dark'] .drawer-footer { background: rgba(2, 6, 23, 0.5); }
[data-theme='dark'] .footer-link { color: #94a3b8; }
[data-theme='dark'] .footer-link:hover { color: #e2e8f0; }

// === RESPONSIVE DESIGN ===
@media (max-width: 1200px) {
  .action-btn {
    padding: 6px 12px;
    font-size: 0.875rem;
    
    .q-icon {
      font-size: 1.2em;
    }
  }
  
  .auth-section {
    gap: 6px;
  }
}

@media (max-width: 1024px) {
  .desktop-nav {
    margin: 0 16px;
    position: static; // fall back in smaller widths (hidden by gt-md)
    left: auto;
    transform: none;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 0.8125rem;
    white-space: nowrap;
    
    // Force visibility for all action buttons
    &.gt-sm {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  }
}

@media (max-width: 768px) {
  .modern-toolbar {
    .q-toolbar {
      padding-left: 16px;
      padding-right: 16px;
      min-height: 60px;
    }
  }
  
  .auth-btn {
    padding: 8px 16px;
    font-size: 0.875rem;
  }
  
  .drawer-header {
    padding: 20px;
  }
  
  .drawer-cta {
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .logo-text {
    font-size: 1.125rem;
  }
  
  .auth-section {
    gap: 8px;
  }
  
  .auth-btn {
    padding: 6px 12px;
    font-size: 0.8125rem;
  }
}

// === ACCESSIBILITY ===
.skip-link {
  position: absolute;
  top: -40px;
  left: 16px;
  background: #6366f1;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 6px;
  z-index: 1000;
  font-weight: 600;
  transition: all var(--transition-fast);
  
  &:focus {
    top: 16px;
  }
}

// === DARK MODE SUPPORT ===
// Dark mode removed - manual theme control only
</style>