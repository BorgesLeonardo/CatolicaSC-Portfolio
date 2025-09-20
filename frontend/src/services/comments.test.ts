import { describe, it, expect } from 'vitest'

// Teste simples para verificar se o serviço existe
describe('Comments Service', () => {
  it('should export commentsService instance', async () => {
    const { commentsService } = await import('./comments')
    expect(commentsService).toBeDefined()
    expect(typeof commentsService.listByProject).toBe('function')
  })

  it('should have create method', async () => {
    const { commentsService } = await import('./comments')
    expect(typeof commentsService.create).toBe('function')
  })

  it('should have delete method', async () => {
    const { commentsService } = await import('./comments')
    expect(typeof commentsService.delete).toBe('function')
  })
})
