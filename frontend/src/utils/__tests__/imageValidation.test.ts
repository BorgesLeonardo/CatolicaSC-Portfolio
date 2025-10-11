import { describe, it, expect } from 'vitest'
import { isValidImageUrl, getImageUrlExamples, processImageUrl } from '../imageValidation'

describe('image validation utils', () => {
  it('validates typical image URLs', () => {
    expect(isValidImageUrl('https://example.com/a.jpg')).toBe(true)
    expect(isValidImageUrl('https://images.unsplash.com/photo-foo')).toBe(true)
    expect(isValidImageUrl('not-a-url')).toBe(false)
  })

  it('provides image examples', () => {
    const examples = getImageUrlExamples()
    expect(Array.isArray(examples)).toBe(true)
    expect(examples.length).toBeGreaterThan(0)
  })

  it('processImageUrl trims and validates', () => {
    expect(processImageUrl('  https://i.imgur.com/x.png  ')).toBe('https://i.imgur.com/x.png')
    expect(processImageUrl('bad')).toBeNull()
  })
})



