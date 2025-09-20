import { describe, it, expect } from 'vitest'
import { calculateProgress } from './calculateProgress'

describe('calculateProgress', () => {
  it('should calculate progress correctly', () => {
    expect(calculateProgress(5000, 10000)).toBe(50)
    expect(calculateProgress(2500, 10000)).toBe(25)
    expect(calculateProgress(7500, 10000)).toBe(75)
  })

  it('should handle zero goal', () => {
    expect(calculateProgress(1000, 0)).toBe(0)
  })

  it('should handle zero raised amount', () => {
    expect(calculateProgress(0, 10000)).toBe(0)
  })

  it('should cap at 100%', () => {
    expect(calculateProgress(15000, 10000)).toBe(100)
    expect(calculateProgress(20000, 10000)).toBe(100)
  })

  it('should handle negative values', () => {
    expect(calculateProgress(-1000, 10000)).toBe(0)
    expect(calculateProgress(1000, -10000)).toBe(0)
  })

  it('should handle decimal results', () => {
    expect(calculateProgress(3333, 10000)).toBe(33.33)
    expect(calculateProgress(1667, 10000)).toBe(16.67)
  })
})
