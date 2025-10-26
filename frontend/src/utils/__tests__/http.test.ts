import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosRequestConfig } from 'axios'
import { http, setAuthToken } from '../http'

describe('http utils', () => {
  beforeEach(() => {
    setAuthToken(null)
  })

  it('setAuthToken sets and clears Authorization header', () => {
    setAuthToken('abc')
    expect(http.defaults.headers.Authorization).toBe('Bearer abc')
    setAuthToken(null)
    expect('Authorization' in (http.defaults.headers as Record<string, unknown>)).toBe(false)
  })

  it('adds Idempotency-Key on mutating requests', async () => {
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.post('/x', { a: 1 }, { adapter })
    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>)['Idempotency-Key']).toBeDefined()
  })

  it('adds Idempotency-Key when headers is non-object and coerced internally', async () => {
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.patch('/z', { a: 1 }, { adapter, headers: 'not-an-object' as unknown as AxiosRequestConfig['headers'] })
    const cfg = adapter.mock.calls[0][0]
    expect(typeof cfg.headers).toBe('object')
    expect((cfg.headers as Record<string, string>)['Idempotency-Key']).toBeDefined()
  })

  it('does not add Idempotency-Key on GET requests', async () => {
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.get('/y', { adapter })
    const cfg = adapter.mock.calls[0][0]
    expect(((cfg.headers || {}) as Record<string, string>)['Idempotency-Key']).toBeUndefined()
  })

  it('attaches Clerk token when available and not already set', async () => {
    const getToken = vi.fn().mockResolvedValue('token-123')
    Object.defineProperty(globalThis, 'Clerk', { value: { session: { getToken } }, configurable: true })
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })

    await http.post('/needs-auth', {}, { adapter })

    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>).Authorization).toBe('Bearer token-123')
  })

  it('does not override Authorization if already present', async () => {
    const getToken = vi.fn().mockResolvedValue('token-ignored')
    Object.defineProperty(globalThis, 'Clerk', { value: { session: { getToken } }, configurable: true })
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })

    await http.post('/already-auth', {}, { adapter, headers: { Authorization: 'Bearer preset' } })

    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>).Authorization).toBe('Bearer preset')
  })

  it('ignores token retrieval errors', async () => {
    const getToken = vi.fn().mockRejectedValue(new Error('boom'))
    Object.defineProperty(globalThis, 'Clerk', { value: { session: { getToken } }, configurable: true })
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })

    await http.post('/auth-error', {}, { adapter })

    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('redirects to sign-in with redirect param on 401 when not already on sign-in', async () => {
    vi.useFakeTimers()

    const original = window.location
    const replace = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...original, hash: '#/projects/123', replace, origin: 'http://localhost', pathname: '/' },
      writable: true,
      configurable: true,
    })

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/needs-login', { adapter })).rejects.toBeDefined()

    await Promise.resolve()
    vi.runAllTimers()

    expect(replace).toHaveBeenCalledTimes(1)
    const url = replace.mock.calls[0][0] as string
    expect(url).toContain('#/sign-in?redirect=')
    expect(decodeURIComponent(url.split('redirect=')[1])).toBe('/projects/123')

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })

  it('redirects to sign-in with "/" redirect when no hash is present', async () => {
    vi.useFakeTimers()

    const original = window.location
    const replace = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...original, hash: '', replace, origin: 'http://localhost', pathname: '/' },
      writable: true,
      configurable: true,
    })

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/needs-login2', { adapter })).rejects.toBeDefined()
    await Promise.resolve()
    vi.runAllTimers()

    const url = replace.mock.calls[0][0] as string
    expect(decodeURIComponent(url.split('redirect=')[1])).toBe('/')

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })

  it('does not redirect if hash changes to sign-in before timeout runs', async () => {
    vi.useFakeTimers()

    const original = window.location
    const replace = vi.fn()
    const loc = { ...original, hash: '#/protected', replace, origin: 'http://localhost', pathname: '/' } as unknown as Location
    Object.defineProperty(window, 'location', { value: loc, writable: true, configurable: true })

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/needs-login3', { adapter })).rejects.toBeDefined()

    // Simulate navigation to sign-in before timer fires
    loc.hash = '#/sign-in'

    await Promise.resolve()
    vi.runAllTimers()

    expect(replace).not.toHaveBeenCalled()

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })

  it('passes through non-401 errors without redirect', async () => {
    const adapter = vi.fn().mockRejectedValue({ response: { status: 500 } })
    await expect(http.get('/server-error', { adapter })).rejects.toBeDefined()
  })

  it('generates idempotency key using crypto.randomUUID when available', async () => {
    const originalCrypto: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto

    const mockUuid = '11111111-1111-4111-8111-111111111111'
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: vi.fn().mockReturnValue(mockUuid) },
      configurable: true,
    })

    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.post('/uuid1', {}, { adapter })
    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>)['Idempotency-Key']).toBe(mockUuid)

    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto })
  })

  it('generates idempotency key using crypto.getRandomValues when randomUUID unavailable', async () => {
    const originalCrypto: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto

    Object.defineProperty(globalThis, 'crypto', {
      value: { getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = (i * 7 + 13) & 0xff
        return arr
      } },
      configurable: true,
    })

    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.post('/uuid2', {}, { adapter })
    const cfg = adapter.mock.calls[0][0]
    expect(((cfg.headers as Record<string, string>)['Idempotency-Key'])?.length).toBeGreaterThan(10)

    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto })
  })

  it('generates idempotency key using fallback when crypto is unavailable', async () => {
    const originalCrypto: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto

    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
    })

    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.post('/uuid3', {}, { adapter })
    const cfg = adapter.mock.calls[0][0]
    const key = (cfg.headers as Record<string, string>)['Idempotency-Key']
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)

    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto })
  })

  it('does not override preset Idempotency-Key header', async () => {
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.post('/preset-ik', {}, { adapter, headers: { 'Idempotency-Key': 'fixed-key' } })
    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>)['Idempotency-Key']).toBe('fixed-key')
  })

  it('does not set Authorization when Clerk returns null token', async () => {
    const getToken = vi.fn().mockResolvedValue(null)
    Object.defineProperty(globalThis, 'Clerk', { value: { session: { getToken } }, configurable: true })
    const adapter = vi.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} as unknown as AxiosRequestConfig })
    await http.post('/null-token', {}, { adapter })
    const cfg = adapter.mock.calls[0][0]
    expect((cfg.headers as Record<string, string>).Authorization).toBeUndefined()
  })
})


