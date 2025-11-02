import { describe, it, expect } from 'vitest'

describe('Services index barrel', () => {
  it('should re-export service instances and types', async () => {
    const mod = await import('./index')
    expect(mod.projectsService).toBeDefined()
    expect(mod.contributionsService).toBeDefined()
    expect(mod.commentsService).toBeDefined()
    expect(mod.connectService).toBeDefined()
  })
})


