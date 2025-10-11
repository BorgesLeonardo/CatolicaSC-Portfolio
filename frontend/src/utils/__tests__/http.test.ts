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
})


