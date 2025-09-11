export function reaisToCents(input: string | number): number {
  if (typeof input === 'number') return Math.round(input * 100)
  const normalized = input.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')
  const value = Number(normalized || 0)
  return Math.round(value * 100)
}
