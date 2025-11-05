import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, clearTempAuthRedirectCookie } from '../http'

describe('http utils - branch coverage', () => {
  beforeEach(() => {
    clearTempAuthRedirectCookie()
  })

  afterEach(() => {
    // cleanup Clerk global in a typed-safe way
    if ('Clerk' in globalThis) {
      // @ts-expect-error - test-only cleanup of injected global
      delete (globalThis as { Clerk?: unknown }).Clerk
    }
  })

  it('does not redirect on 401 when Clerk token exists (avoid loop)', async () => {
    vi.useFakeTimers()

    const original = window.location
    Object.defineProperty(window, 'location', {
      value: { ...original, hash: '#/protected', origin: 'http://localhost', pathname: '/' },
      writable: true,
      configurable: true,
    })

    const getToken = vi.fn().mockResolvedValue('tok-123')
    Object.defineProperty(globalThis, 'Clerk', { value: { session: { getToken } }, configurable: true })

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/needs-auth', { adapter })).rejects.toBeDefined()
    await Promise.resolve()
    vi.runAllTimers()

    expect(window.location.hash).toBe('#/protected')

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })

  it('performs redirect flow on https (secure cookie path exercised)', async () => {
    vi.useFakeTimers()

    const original = window.location
    Object.defineProperty(window, 'location', {
      value: { ...original, protocol: 'https:', hash: '#/abc', origin: 'https://localhost', pathname: '/' },
      writable: true,
      configurable: true,
    })

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/401', { adapter })).rejects.toBeDefined()
    await Promise.resolve()
    vi.runAllTimers()

    expect(window.location.hash).toContain('#/sign-in?redirect=')

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })

  it('does not redirect when already on sign-up route', async () => {
    vi.useFakeTimers()

    const original = window.location
    Object.defineProperty(window, 'location', {
      value: { ...original, hash: '#/sign-up', origin: 'http://localhost', pathname: '/' },
      writable: true,
      configurable: true,
    })

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/already-auth', { adapter })).rejects.toBeDefined()
    await Promise.resolve()
    vi.runAllTimers()

    expect(window.location.hash).toBe('#/sign-up')

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })

  it('cookie suppression prevents redirect', async () => {
    vi.useFakeTimers()

    const original = window.location
    Object.defineProperty(window, 'location', {
      value: { ...original, hash: '#/dashboard', origin: 'http://localhost', pathname: '/' },
      writable: true,
      configurable: true,
    })

    document.cookie = 'auth_redirect_suppress=1; Max-Age=30; Path=/'

    const adapter = vi.fn().mockRejectedValue({ response: { status: 401 } })

    await expect(http.get('/suppressed', { adapter })).rejects.toBeDefined()
    await Promise.resolve()
    vi.runAllTimers()

    expect(window.location.hash).toBe('#/dashboard')

    Object.defineProperty(window, 'location', { value: original })
    vi.useRealTimers()
  })
})


