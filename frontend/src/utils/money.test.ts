import { describe, it, expect } from 'vitest'
import { reaisToCents } from './money'

describe('money utilities', () => {
  describe('reaisToCents', () => {
    it('converte string de reais para centavos', () => {
      expect(reaisToCents('100,00')).toBe(10000)
      expect(reaisToCents('50,50')).toBe(5050)
      expect(reaisToCents('1.000,00')).toBe(100000)
      expect(reaisToCents('0,99')).toBe(99)
    })

    it('converte número para centavos', () => {
      expect(reaisToCents(100)).toBe(10000)
      expect(reaisToCents(50.5)).toBe(5050)
      expect(reaisToCents(0.99)).toBe(99)
    })

    it('remove caracteres não numéricos', () => {
      expect(reaisToCents('R$ 100,00')).toBe(10000)
      expect(reaisToCents('R$ 1.000,00')).toBe(100000)
      expect(reaisToCents('R$ 0,99')).toBe(99)
    })

    it('trata valores vazios como zero', () => {
      expect(reaisToCents('')).toBe(0)
      expect(reaisToCents('   ')).toBe(0)
      expect(reaisToCents('abc')).toBe(0)
    })

    it('arredonda valores decimais', () => {
      expect(reaisToCents(100.999)).toBe(10100)
      expect(reaisToCents(50.555)).toBe(5056)
    })

    it('trata diferentes formatos de entrada', () => {
      expect(reaisToCents('100.000,00')).toBe(10000000)
      expect(reaisToCents('1,50')).toBe(150)
      expect(reaisToCents('0,01')).toBe(1)
    })
  })
})
