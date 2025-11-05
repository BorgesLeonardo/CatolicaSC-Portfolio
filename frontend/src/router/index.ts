import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { clearTempAuthRedirectCookie } from 'src/utils/http'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Centraliza redirecionamentos para evitar navegação extra/recarregadas
  type ClerkLike = { Clerk?: { user?: unknown; session?: unknown } };
  function isSignedInNow(): boolean {
    try {
      const g = globalThis as unknown as ClerkLike
      return !!(g?.Clerk?.user || g?.Clerk?.session)
    } catch {
      return false
    }
  }

  function getSession<T = string>(key: string): T | null {
    try {
      return (typeof window !== 'undefined' && window.sessionStorage)
        ? (window.sessionStorage.getItem(key) as unknown as T | null)
        : null
    } catch {
      return null
    }
  }

  function setSession(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value)
      }
    } catch {
      // ignore
    }
  }

  function removeSession(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key)
      }
    } catch {
      // ignore
    }
  }

  Router.beforeEach((to, _from, next) => {
    const signed = isSignedInNow()
    const isAuthPage = to.path === '/sign-in' || to.path === '/sign-up'

    // Debounce para evitar redirecionamentos duplicados encadeados
    const now = Date.now()
    const lastNavTs = Number(getSession('last_auth_nav_ts') || 0)
    const debounced = now - lastNavTs < 500

    // Se já está logado e acessa página de auth, volta para redirect ou home
    if (signed && isAuthPage && !debounced) {
      const target = typeof to.query.redirect === 'string' && to.query.redirect
        ? String(to.query.redirect)
        : '/'
      setSession('last_auth_nav_ts', String(now))
      // Limpa supressão/flags
      removeSession('auth_redirect_ts')
      removeSession('auth_redirect_path')
      clearTempAuthRedirectCookie()
      return next(target)
    }

    // Se temos um destino pendente salvo antes de ir para login, prioriza ele após login
    const pending = getSession('auth_redirect_path')
    if (signed && pending && !debounced) {
      const decoded = decodeURIComponent(pending)
      // Evita loop se já estamos no destino
      if (to.fullPath !== decoded) {
        setSession('last_auth_nav_ts', String(now))
        removeSession('auth_redirect_ts')
        removeSession('auth_redirect_path')
        clearTempAuthRedirectCookie()
        return next(decoded)
      }
      // Se já estamos no destino, apenas limpa os marcadores
      removeSession('auth_redirect_ts')
      removeSession('auth_redirect_path')
      clearTempAuthRedirectCookie()
    }

    return next()
  })

  return Router;
});
