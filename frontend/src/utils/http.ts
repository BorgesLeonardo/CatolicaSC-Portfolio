import axios, { type AxiosRequestConfig, type AxiosError } from 'axios'
import { cryptoRandomUuid } from './crypto'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333',
})

// Controla redirecionamentos para evitar loops em produção
let lastAuthRedirectAt = 0

function getRedirectSuppressTtlSeconds(): number {
  try {
    const raw = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AUTH_REDIRECT_TTL_SECONDS)
      ? String(import.meta.env.VITE_AUTH_REDIRECT_TTL_SECONDS)
      : (typeof process !== 'undefined' ? process.env?.VITE_AUTH_REDIRECT_TTL_SECONDS : undefined)
    const n = raw ? Number(raw) : NaN
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      return Math.max(2, Math.min(60, Math.floor(n)))
    }
  } catch {
    // ignore
  }
  return 10
}

// Cookie helpers to suppress multiple auth redirects in a short window
function setTempAuthRedirectCookie(w: Window, seconds = 10): void {
  try {
    const secure = w.location.protocol === 'https:'
    const parts = [
      'auth_redirect_suppress=1',
      `Max-Age=${Math.max(1, Math.min(60, Math.floor(seconds)))}`,
      'Path=/',
      'SameSite=Lax',
    ]
    if (secure) parts.push('Secure')
    w.document.cookie = parts.join('; ')
  } catch {
    // ignore cookie write failures
  }
}

function hasTempAuthRedirectCookie(w: Window): boolean {
  try {
    return typeof w.document?.cookie === 'string' && /(?:^|; )auth_redirect_suppress=1(?:;|$)/.test(w.document.cookie)
  } catch {
    return false
  }
}

export function clearTempAuthRedirectCookie(): void {
  try {
    if (typeof window !== 'undefined') {
      window.document.cookie = 'auth_redirect_suppress=; Max-Age=0; Path=/; SameSite=Lax'
    }
  } catch {
    // ignore
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Função para configurar o token manualmente quando necessário
export function setAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.Authorization = `Bearer ${token}`
  } else {
    delete http.defaults.headers.Authorization
  }
}

// Interceptor para tratar erros de resposta
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 1) Se houver sessão do Clerk, tente obter token e refazer a requisição UMA vez
      type RetryableConfig = AxiosRequestConfig & { headers?: Record<string, string>; __retriedWithToken?: boolean }
      const baseCfg = (error.config ?? {}) as AxiosRequestConfig
      const cfg: RetryableConfig = { ...baseCfg }
      type ClerkLikeGlobal = { Clerk?: { session?: { getToken?: () => Promise<string | null | undefined> } } }
      const g = globalThis as unknown as ClerkLikeGlobal
      try {
        const canGetToken = !!g?.Clerk?.session && typeof g.Clerk.session.getToken === 'function'
        if (canGetToken && !cfg.__retriedWithToken) {
          // Tenta obter o token algumas vezes rapidamente (corrige race que some com DevTools)
          let token: string | null | undefined = null
          for (let i = 0; i < 3 && !token; i++) {
            token = await g.Clerk.session.getToken()
            if (!token) await sleep(180)
          }
          if (token) {
            cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` }
            cfg.__retriedWithToken = true
            return http.request(cfg)
          }
        }
      } catch {
        // ignore and fall through to redirect logic
      }

      // 2) Se já existe sessão e token disponível mas mesmo assim deu 401,
      //    não redireciona — evita loop se o backend ainda estiver inicializando.
      try {
        const g2 = globalThis as unknown as { Clerk?: { session?: { getToken?: () => Promise<string | null | undefined> } } }
        if (g2?.Clerk?.session && typeof g2.Clerk.session.getToken === 'function') {
          const token = await g2.Clerk.session.getToken()
          if (token) {
            return Promise.reject(error)
          }
        }
      } catch {
        // ignore
      }

      // 3) Evita loop e só redireciona se não estiver no sign-in/sign-up
      const w = typeof window !== 'undefined' ? window : undefined
      if (w) {
        const hash = w.location.hash || '#/'
        const path = hash.startsWith('#') ? hash.substring(1) : hash
        const onAuth = path.startsWith('/sign-in') || path.startsWith('/sign-up')
        // In test mode, disable time-based suppression to avoid cross-test leakage
        const mode = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE)
          ? import.meta.env.MODE
          : (typeof process !== 'undefined' ? (process.env?.NODE_ENV || 'development') : 'development')
        const isTest = String(mode) === 'test'
        const tooSoon = !isTest && (Date.now() - lastAuthRedirectAt < 4000)
        // Bloqueio adicional: se já redirecionamos recentemente nesta sessão, não repetir
        const ssTs = Number((w.sessionStorage && w.sessionStorage.getItem('auth_redirect_ts')) || 0)
        const sessionRecent = !isTest && (Date.now() - ssTs < 10000)
        const cookieSuppressed = hasTempAuthRedirectCookie(w)
        if (!onAuth && !tooSoon && !sessionRecent && !cookieSuppressed) {
          // Defer para o próximo tick, evitando reentrância durante navegação
          setTimeout(() => {
            const curHash = w.location.hash || '#/'
            const curPath = curHash.startsWith('#') ? curHash.substring(1) : curHash
            const nowOnAuth = curPath.startsWith('/sign-in') || curPath.startsWith('/sign-up')
            if (!nowOnAuth) {
              const redirect = encodeURIComponent(curPath || '/')
              lastAuthRedirectAt = Date.now()
              try {
                if (w.sessionStorage) {
                  w.sessionStorage.setItem('auth_redirect_ts', String(lastAuthRedirectAt))
                  w.sessionStorage.setItem('auth_redirect_path', redirect)
                }
              } catch (_err) {
                if (import.meta.env.DEV) console.debug(_err)
              }
              // Set a short-lived cookie to suppress repeated redirects
              setTempAuthRedirectCookie(w, getRedirectSuppressTtlSeconds())
              w.location.replace(`${w.location.origin}${w.location.pathname}#/sign-in?redirect=${redirect}`)
            }
          }, 0)
        }
      }
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

// Attach Idempotency-Key automatically for mutating requests when not set
type StringHeaders = Record<string, string>;

function ensureMutableStringHeaders(config: { headers?: unknown }): StringHeaders {
  const input = (config.headers ?? {}) as Record<string, unknown>
  const output: StringHeaders = {}
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      output[key] = value
    }
  }
  return output
}

type ClerkLike = { Clerk?: { session?: { getToken?: () => Promise<string | null | undefined> } } };

http.interceptors.request.use(async (config) => {
  const method = String(config.method || 'get').toLowerCase()
  if ((method === 'post' || method === 'put' || method === 'patch') && !(config.headers as unknown as Record<string, unknown> | undefined)?.['Idempotency-Key']) {
    const key = cryptoRandomUuid()
    const headers = ensureMutableStringHeaders(config)
    headers['Idempotency-Key'] = key
    config.headers = headers
  }

  // Ensure Clerk token is attached if available and not already set
  const hasAuth = !!(config.headers as Record<string, unknown> | undefined)?.Authorization
  const w = globalThis as unknown as ClerkLike
  try {
    if (!hasAuth && w?.Clerk?.session && typeof w.Clerk.session.getToken === 'function') {
      const token = await w.Clerk.session.getToken()
      if (token) {
        const headers = ensureMutableStringHeaders(config)
        headers.Authorization = `Bearer ${token}`
        config.headers = headers
      }
    }
  } catch {
    // ignore token retrieval errors; response interceptor will handle 401
  }

  return config
})
