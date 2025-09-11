import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatMoneyBRL, formatDateTimeBR, isPast } from './format'

describe('format utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
  })

  describe('formatMoneyBRL', () => {
    it('formata centavos para reais corretamente', () => {
      expect(formatMoneyBRL(100000)).toMatch(/R\$\s*1\.000,00/)
      expect(formatMoneyBRL(5000)).toMatch(/R\$\s*50,00/)
      expect(formatMoneyBRL(100)).toMatch(/R\$\s*1,00/)
      expect(formatMoneyBRL(0)).toMatch(/R\$\s*0,00/)
    })

    it('retorna "—" para valores null ou undefined', () => {
      expect(formatMoneyBRL(null)).toBe('—')
      expect(formatMoneyBRL(undefined)).toBe('—')
    })

    it('formata valores decimais corretamente', () => {
      expect(formatMoneyBRL(123456)).toMatch(/R\$\s*1\.234,56/)
      expect(formatMoneyBRL(999)).toMatch(/R\$\s*9,99/)
    })
  })

  describe('formatDateTimeBR', () => {
    it('formata string ISO corretamente', () => {
      const result = formatDateTimeBR('2025-12-31T23:59:59Z')
      expect(result).toMatch(/31.*dez.*2025/)
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('formata objeto Date corretamente', () => {
      const date = new Date('2025-06-15T14:30:00Z')
      const result = formatDateTimeBR(date)
      expect(result).toMatch(/15.*jun.*2025/)
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('formata data com fuso horário local', () => {
      const result = formatDateTimeBR('2025-01-01T12:00:00Z')
      expect(result).toMatch(/1.*jan.*2025/)
    })
  })

  describe('isPast', () => {
    it('retorna true para datas no passado', () => {
      expect(isPast('2024-12-31T23:59:59Z')).toBe(true)
      expect(isPast(new Date('2024-01-01T00:00:00Z'))).toBe(true)
    })

    it('retorna false para datas no futuro', () => {
      expect(isPast('2025-12-31T23:59:59Z')).toBe(false)
      expect(isPast(new Date('2026-01-01T00:00:00Z'))).toBe(false)
    })

    it('retorna false para data atual', () => {
      expect(isPast('2025-01-01T12:00:00Z')).toBe(false)
    })
  })
})
