export function formatMoneyBRL(cents: number | null | undefined): string {
  if (cents == null) return '—'
  const v = Number(cents) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatDateTimeBR(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

export function isPast(iso: string | Date): boolean {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.getTime() < Date.now()
}
