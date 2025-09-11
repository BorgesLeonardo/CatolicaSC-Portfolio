import { describe, it, expect } from 'vitest'
import { mergeDateTimeToISO } from './datetime'

describe('datetime utilities', () => {
  describe('mergeDateTimeToISO', () => {
    it('combina data e hora corretamente', () => {
      const result = mergeDateTimeToISO('2025-12-31', '14:30')
      // Ajusta para o fuso horário local (UTC-3 no Brasil)
      expect(result).toBe('2025-12-31T17:30:00.000Z')
    })

    it('usa hora padrão quando não fornecida', () => {
      const result = mergeDateTimeToISO('2025-12-31')
      // Ajusta para o fuso horário local (UTC-3 no Brasil)
      expect(result).toBe('2026-01-01T02:59:00.000Z')
    })

    it('usa hora padrão quando string vazia', () => {
      const result = mergeDateTimeToISO('2025-12-31', '')
      // Ajusta para o fuso horário local (UTC-3 no Brasil)
      expect(result).toBe('2026-01-01T02:59:00.000Z')
    })

    it('trata diferentes formatos de hora', () => {
      expect(mergeDateTimeToISO('2025-01-01', '00:00')).toBe('2025-01-01T03:00:00.000Z')
      expect(mergeDateTimeToISO('2025-01-01', '23:59')).toBe('2025-01-02T02:59:00.000Z')
      expect(mergeDateTimeToISO('2025-01-01', '12:30')).toBe('2025-01-01T15:30:00.000Z')
    })

    it('trata diferentes formatos de data', () => {
      expect(mergeDateTimeToISO('2025-01-01', '12:00')).toBe('2025-01-01T15:00:00.000Z')
      expect(mergeDateTimeToISO('2025-12-31', '12:00')).toBe('2025-12-31T15:00:00.000Z')
      expect(mergeDateTimeToISO('2025-06-15', '12:00')).toBe('2025-06-15T15:00:00.000Z')
    })

    it('retorna string ISO válida', () => {
      const result = mergeDateTimeToISO('2025-12-31', '14:30')
      const date = new Date(result)
      expect(date.toISOString()).toBe(result)
    })
  })
})
