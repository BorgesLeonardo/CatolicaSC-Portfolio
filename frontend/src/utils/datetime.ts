export function mergeDateTimeToISO(dateStr: string, timeStr?: string): string {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = (timeStr || '23:59').split(':').map(Number)
  const dt = new Date(y, (m - 1), d, hh, mm, 0)
  return dt.toISOString()
}
