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

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0'
  return new Intl.NumberFormat('pt-BR').format(num)
}

export function formatProgressPercentage(raised: number, goal: number): number {
  if (!goal || goal === 0) return 0
  const percentage = Math.floor((raised / goal) * 100)
  return Math.min(percentage, 100) // Cap at 100% for display
}

export function calculateDaysLeft(deadline: string | Date): number {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}