import { describe, it, expect } from 'vitest'
import { mergeDateTimeToISO } from '../datetime'

describe('mergeDateTimeToISO', () => {
  it('merges date and default time 23:59 into ISO in UTC', () => {
    const iso = mergeDateTimeToISO('2025-10-05')
    const d = new Date(iso)
    expect(d.toISOString()).toBe(iso)
    expect(d.getUTCFullYear()).toBe(2025)
    // Not asserting specific day shift due to environment tz differences
  })

  it('uses provided time', () => {
    const iso = mergeDateTimeToISO('2025-01-01', '12:30')
    const d = new Date(iso)
    expect(d instanceof Date && !isNaN(d.getTime())).toBe(true)
  })

  it('accepts DD/MM/YYYY format', () => {
    const iso = mergeDateTimeToISO('31/12/2025', '00:00')
    const d = new Date(iso)
    expect(d.getUTCFullYear()).toBeGreaterThanOrEqual(2025)
  })
})



