import { describe, it, expect } from 'vitest'

// Teste simples para verificar se o serviço existe
describe('Contributions Service', () => {
  it('should export contributionsService instance', async () => {
    const { contributionsService } = await import('./contributions')
    expect(contributionsService).toBeDefined()
    expect(typeof contributionsService.createCheckout).toBe('function')
  })

  it('should have getByProject method', async () => {
    const { contributionsService } = await import('./contributions')
    expect(typeof contributionsService.listByProject).toBe('function')
  })

  it('should have hasContributions method', async () => {
    const { contributionsService } = await import('./contributions')
    expect(typeof contributionsService.hasContributions).toBe('function')
  })
})
