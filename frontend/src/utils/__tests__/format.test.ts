import { describe, it, expect } from 'vitest'
import { formatMoneyBRL, formatDateTimeBR, isPast, formatNumber, formatProgressPercentage, calculateDaysLeft } from '../format'

describe('format utils', () => {
  it('formatMoneyBRL formats cents to BRL', () => {
    expect(formatMoneyBRL(12345)).toMatch(/R\$\s?123,45/)
    expect(formatMoneyBRL(null)).toBe('—')
  })

  it('formatDateTimeBR formats date to pt-BR', () => {
    const date = new Date('2025-01-01T00:00:00.000Z')
    const out = formatDateTimeBR(date)
    expect(out).toBeTypeOf('string')
    expect(out.length).toBeGreaterThan(5)
  })

  it('isPast compares with now', () => {
    const past = new Date(Date.now() - 1000)
    const future = new Date(Date.now() + 1000)
    expect(isPast(past)).toBe(true)
    expect(isPast(future)).toBe(false)
  })

  it('formatNumber handles null and numbers', () => {
    expect(formatNumber(null)).toBe('0')
    // Match either "1.000" or "1,000" depending on locale; no unnecessary escapes
    expect(formatNumber(1000)).toMatch(/1(\.|,)000/)
  })

  it('formatProgressPercentage caps at 100 and returns 0 when goal 0', () => {
    expect(formatProgressPercentage(50, 100)).toBe(50)
    expect(formatProgressPercentage(200, 100)).toBe(100)
    expect(formatProgressPercentage(10, 0)).toBe(0)
  })

  it('calculateDaysLeft returns non-negative days', () => {
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    expect(calculateDaysLeft(tomorrow)).toBeGreaterThanOrEqual(1)
    expect(calculateDaysLeft(yesterday)).toBe(0)
  })
})



