import { describe, it, expect } from 'vitest'

// Teste simples para verificar se o serviço existe
describe('Categories Service', () => {
  it('should export categoriesService instance', async () => {
    const { categoriesService } = await import('./categories')
    expect(categoriesService).toBeDefined()
    expect(typeof categoriesService.getAll).toBe('function')
  })

  it('should have getById method', async () => {
    const { categoriesService } = await import('./categories')
    expect(typeof categoriesService.getById).toBe('function')
  })
})
