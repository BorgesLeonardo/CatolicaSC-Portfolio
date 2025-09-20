import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date(2024, 0, 15) // Month is 0-indexed
    expect(formatDate(date)).toBe('15/01/2024')
  })

  it('should format date with different months', () => {
    const date = new Date(2024, 11, 25) // Month is 0-indexed
    expect(formatDate(date)).toBe('25/12/2024')
  })

  it('should handle single digit days and months', () => {
    const date = new Date(2024, 0, 5) // Month is 0-indexed
    expect(formatDate(date)).toBe('05/01/2024')
  })

  it('should handle different years', () => {
    const date = new Date(2023, 5, 10) // Month is 0-indexed
    expect(formatDate(date)).toBe('10/06/2023')
  })
})
