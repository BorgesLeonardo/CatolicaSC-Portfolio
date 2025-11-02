import axios, { type AxiosRequestConfig, type AxiosError } from 'axios'
import { cryptoRandomUuid } from './crypto'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333',
})

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
          const token: string | null | undefined = await g.Clerk.session.getToken()
          if (token) {
            cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` }
            cfg.__retriedWithToken = true
            return http.request(cfg)
          }
        }
      } catch {
        // ignore and fall through to redirect logic
      }

      // 2) Evita loop e só redireciona se não estiver no sign-in/sign-up
      const w = typeof window !== 'undefined' ? window : undefined
      if (w) {
        const hash = w.location.hash || '#/'
        const path = hash.startsWith('#') ? hash.substring(1) : hash
        const onAuth = path.startsWith('/sign-in') || path.startsWith('/sign-up')
        if (!onAuth) {
          // Defer para o próximo tick, evitando reentrância durante navegação
          setTimeout(() => {
            const curHash = w.location.hash || '#/'
            const curPath = curHash.startsWith('#') ? curHash.substring(1) : curHash
            const nowOnAuth = curPath.startsWith('/sign-in') || curPath.startsWith('/sign-up')
            if (!nowOnAuth) {
              const redirect = encodeURIComponent(curPath || '/')
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
