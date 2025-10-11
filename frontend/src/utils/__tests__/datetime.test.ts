import { describe, it, expect } from 'vitest'
import { mergeDateTimeToISO } from '../datetime'

describe('mergeDateTimeToISO', () => {
  it('merges date and default time 23:59 into ISO in UTC', () => {
    const iso = mergeDateTimeToISO('2025-10-05')
    const d = new Date(iso)
    expect(d.toISOString()).toBe(iso)
    expect(d.getUTCFullYear()).toBe(2025)
    expect(d.getUTCMonth()).toBe(9) // October is 9 (0-based)
    expect(d.getUTCDate()).toBe(6) // 2025-10-05T23:59 in UTC-3 is +3h => 2025-10-06
  })

  it('uses provided time', () => {
    const iso = mergeDateTimeToISO('2025-01-01', '12:30')
    const d = new Date(iso)
    expect(d.getUTCHours()).toBe(15) // 12:30 BR -> +3h = 15:30 UTC
    expect(d.getUTCMinutes()).toBe(30)
  })
})



