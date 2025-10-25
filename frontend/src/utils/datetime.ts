export function mergeDateTimeToISO(dateStr: string, timeStr?: string): string {
  // Aceita 'YYYY-MM-DD' ou 'DD/MM/YYYY'
  let y: number, m: number, d: number
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    [y, m, d] = dateStr.split('-').map(Number)
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/').map(Number)
    d = parts[0]; m = parts[1]; y = parts[2]
  } else {
    // Fallback: deixa o Date tentar interpretar, depois normaliza
    const tmp = new Date(dateStr)
    y = tmp.getFullYear(); m = tmp.getMonth() + 1; d = tmp.getDate()
  }

  const [hh, mm] = (timeStr || '23:59').split(':').map(Number)

  // Constrói como horário local (Brasil) e depois converte para ISO
  const localDate = new Date(y, (m - 1), d, hh, mm, 0)
  return new Date(localDate.getTime()).toISOString()
}
