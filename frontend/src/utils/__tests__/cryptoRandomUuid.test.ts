import { describe, it, expect, vi, afterEach } from 'vitest'
import { cryptoRandomUuid } from '../crypto'

const ORIGINAL_CRYPTO: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto

afterEach(() => {
  // Restore original crypto after each test
  Object.defineProperty(globalThis, 'crypto', { value: ORIGINAL_CRYPTO, configurable: true })
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('cryptoRandomUuid', () => {
  it('uses crypto.randomUUID when available', () => {
    const mockUuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: vi.fn().mockReturnValue(mockUuid) },
      configurable: true,
    })

    const out = cryptoRandomUuid()
    expect(out).toBe(mockUuid)
  })

  it('uses crypto.getRandomValues when randomUUID is not available', () => {
    // Deterministic fill for bytes 0..15
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) arr[i] = i
          return arr
        },
      },
      configurable: true,
    })

    const out = cryptoRandomUuid()
    // Should be a valid v4 UUID with correct variant
    expect(out).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('falls back to non-crypto path when crypto is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })
    // Stabilize Date.now for deterministic output shape
    vi.spyOn(Date, 'now').mockReturnValue(123456)

    const out = cryptoRandomUuid()
    expect(out.length).toBe(36)
    expect(out[8]).toBe('-')
    expect(out[13]).toBe('-')
    expect(out[18]).toBe('-')
    expect(out[23]).toBe('-')
    // Version nibble is fixed to 4 by the template
    expect(out[14]).toBe('4')
  })
})


