import { describe, it, expect } from 'vitest'

describe('Project Videos Service', () => {
  it('should export projectVideosService object', async () => {
    const { projectVideosService } = await import('./project-videos')
    expect(projectVideosService).toBeDefined()
    expect(typeof projectVideosService.uploadVideo).toBe('function')
    expect(typeof projectVideosService.deleteVideo).toBe('function')
  })
})


