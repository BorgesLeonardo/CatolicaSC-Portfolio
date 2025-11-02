import { describe, it, expect } from 'vitest'

describe('Connect Service', () => {
  it('should export connectService instance', async () => {
    const { connectService } = await import('./connect')
    expect(connectService).toBeDefined()
    expect(typeof connectService.onboard).toBe('function')
    expect(typeof connectService.status).toBe('function')
    expect(typeof connectService.dashboardLink).toBe('function')
  })
})


