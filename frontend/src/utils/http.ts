import axios from 'axios'

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
    if (error.response?.status === 401) {
      // Evita loop e só redireciona se não estiver no sign-in
      const w = typeof window !== 'undefined' ? window : undefined
      if (w) {
        const hash = w.location.hash || '#/'
        const path = hash.startsWith('#') ? hash.substring(1) : hash
        if (!path.startsWith('/sign-in')) {
          // Defer para o próximo tick, evitando reentrância durante navegação
          setTimeout(() => {
            const curHash = w.location.hash || '#/'
            const curPath = curHash.startsWith('#') ? curHash.substring(1) : curHash
            if (!curPath.startsWith('/sign-in')) {
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

function cryptoRandomUuid(): string {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto
  try {
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID.call(c)
    }
    if (c && typeof c.getRandomValues === 'function') {
      const bytes = new Uint8Array(16)
      c.getRandomValues(bytes)
      // Per RFC 4122 section 4.4
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80
      const toHex = (n: number) => n.toString(16).padStart(2, '0')
      const b = Array.from(bytes, toHex).join('')
      return `${b.slice(0,8)}-${b.slice(8,12)}-${b.slice(12,16)}-${b.slice(16,20)}-${b.slice(20)}`
    }
  } catch {
    // ignore and use fallback
  }
  // minimal non-crypto fallback (very unlikely path in modern runtimes)
  let now = Date.now()
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  let out = ''
  for (let i = 0; i < template.length; i++) {
    const ch = template[i]
    if (ch === 'x' || ch === 'y') {
      now = (now + 1) % 16
      const v = ch === 'x' ? now : ((now & 0x3) | 0x8)
      out += v.toString(16)
    } else {
      out += ch
    }
  }
  return out
}