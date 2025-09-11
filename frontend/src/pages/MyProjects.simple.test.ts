import { describe, it, expect } from 'vitest'

describe('MyProjects - Simple Tests', () => {
  it('should be importable', () => {
    expect(() => import('./MyProjects.vue')).not.toThrow()
  })
})
