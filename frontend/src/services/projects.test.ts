import { describe, it, expect } from 'vitest'

// Teste simples para verificar se o serviço existe
describe('Projects Service', () => {
  it('should export projectsService instance', async () => {
    const { projectsService } = await import('./projects')
    expect(projectsService).toBeDefined()
    expect(typeof projectsService.list).toBe('function')
  })

  it('should have getById method', async () => {
    const { projectsService } = await import('./projects')
    expect(typeof projectsService.getById).toBe('function')
  })

  it('should have create method', async () => {
    const { projectsService } = await import('./projects')
    expect(typeof projectsService.create).toBe('function')
  })

  it('should have update method', async () => {
    const { projectsService } = await import('./projects')
    expect(typeof projectsService.update).toBe('function')
  })

  it('should have delete method', async () => {
    const { projectsService } = await import('./projects')
    expect(typeof projectsService.delete).toBe('function')
  })
})
