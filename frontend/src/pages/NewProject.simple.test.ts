import { describe, it, expect } from 'vitest'

describe('NewProject - Simple Tests', () => {
  it('should be importable', () => {
    expect(() => import('./NewProject.vue')).not.toThrow()
  })
})
