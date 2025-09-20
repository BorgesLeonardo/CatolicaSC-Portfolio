import { describe, it, expect } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('should format currency correctly for positive values', () => {
    expect(formatCurrency(1000)).toBe('R$ 10,00')
    expect(formatCurrency(15000)).toBe('R$ 150,00')
    expect(formatCurrency(100000)).toBe('R$ 1.000,00')
  })

  it('should format currency correctly for zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000)).toBe('R$ 10.000,00')
    expect(formatCurrency(1234567)).toBe('R$ 12.345,67')
  })

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-R$ 10,00')
    expect(formatCurrency(-15000)).toBe('-R$ 150,00')
  })
})
