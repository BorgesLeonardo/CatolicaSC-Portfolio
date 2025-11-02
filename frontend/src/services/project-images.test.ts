import { describe, it, expect } from 'vitest'

describe('Project Images Service', () => {
  it('should export projectImagesService instance', async () => {
    const { projectImagesService } = await import('./project-images')
    expect(projectImagesService).toBeDefined()
    expect(typeof projectImagesService.uploadImages).toBe('function')
    expect(typeof projectImagesService.getProjectImages).toBe('function')
    expect(typeof projectImagesService.deleteImage).toBe('function')
    expect(typeof projectImagesService.reorderImages).toBe('function')
  })
})


