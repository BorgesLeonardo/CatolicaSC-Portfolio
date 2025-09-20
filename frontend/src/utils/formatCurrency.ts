/**
 * Formats a value in cents to Brazilian Real currency format
 * @param cents - Value in cents
 * @returns Formatted currency string
 */
export function formatCurrency(cents: number): string {
  const value = cents / 100
  const isNegative = value < 0
  const absoluteValue = Math.abs(value)
  
  const formatted = absoluteValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return `${isNegative ? '-' : ''}R$ ${formatted}`
}
