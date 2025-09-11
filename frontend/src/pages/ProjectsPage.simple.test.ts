import { describe, it, expect } from 'vitest'

describe('ProjectsPage - Simple Tests', () => {
  it('should be importable', () => {
    expect(() => import('./ProjectsPage.vue')).not.toThrow()
  })
})
