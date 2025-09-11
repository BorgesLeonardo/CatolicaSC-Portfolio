export function mergeDateTimeToISO(dateStr: string, timeStr?: string): string {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = (timeStr || '23:59').split(':').map(Number)
  
  // Create date in Brazil timezone (UTC-3)
  const dt = new Date(y, (m - 1), d, hh, mm, 0)
  
  // Adjust for Brazil timezone (UTC-3)
  // Brazil is UTC-3, so we need to add 3 hours to get UTC
  const utcTime = new Date(dt.getTime() + (3 * 60 * 60 * 1000))
  
  return utcTime.toISOString()
}
