import { describe, it, expect } from 'vitest'
import { reaisToCents } from '../money'

describe('reaisToCents', () => {
  it('converts number to cents', () => {
    expect(reaisToCents(12.34)).toBe(1234)
  })

  it('parses BRL formatted string', () => {
    expect(reaisToCents('R$ 1.234,56')).toBe(123456)
    expect(reaisToCents('1.234,56')).toBe(123456)
    expect(reaisToCents('0,99')).toBe(99)
    expect(reaisToCents('')).toBe(0)
  })
})



