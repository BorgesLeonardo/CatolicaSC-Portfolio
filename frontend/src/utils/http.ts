import axios from 'axios'
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
  (error) => {
    // Não force redirecionamento global em 401 para evitar loops com Clerk; deixe a tela atual tratar
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

// Attach Idempotency-Key automatically for mutating requests when not set
type StringHeaders = Record<string, string>;

function ensureMutableStringHeaders(config: typeof http.defaults): StringHeaders {
  const hdrs = (config.headers ?? {}) as unknown;
  if (typeof hdrs === 'object' && hdrs !== null) {
    return hdrs as StringHeaders;
  }
  return {} as StringHeaders;
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
  const hasAuth = !!(config.headers as unknown as Record<string, unknown> | undefined)?.Authorization
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
