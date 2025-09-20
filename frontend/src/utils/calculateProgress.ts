/**
 * Calculates the progress percentage of a fundraising goal
 * @param raised - Amount raised in cents
 * @param goal - Goal amount in cents
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(raised: number, goal: number): number {
  if (goal <= 0 || raised <= 0) {
    return 0
  }
  
  const progress = (raised / goal) * 100
  return Math.min(Math.round(progress * 100) / 100, 100)
}
