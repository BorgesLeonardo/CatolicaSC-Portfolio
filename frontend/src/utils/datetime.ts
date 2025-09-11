export function mergeDateTimeToISO(dateStr: string, timeStr?: string): string {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = (timeStr || '23:59').split(':').map(Number)
  
  // Create date in Brazil timezone (UTC-3)
  // Brazil is UTC-3, so we need to add 3 hours to convert Brazil time to UTC
  const dt = new Date(Date.UTC(y, (m - 1), d, hh + 3, mm, 0))
  
  return dt.toISOString()
}
