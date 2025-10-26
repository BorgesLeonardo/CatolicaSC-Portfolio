import { describe, it, expect } from 'vitest'
import { isValidImageUrl, getImageUrlExamples, processImageUrl } from '../imageValidation'

describe('image validation utils', () => {
  it('validates typical image URLs', () => {
    expect(isValidImageUrl('https://example.com/a.jpg')).toBe(true)
    expect(isValidImageUrl('https://images.unsplash.com/photo-foo')).toBe(true)
    expect(isValidImageUrl('not-a-url')).toBe(false)
  })

  it('accepts known image service domains', () => {
    expect(isValidImageUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe(true)
    expect(isValidImageUrl('https://cdn.pixabay.com/photo/12345')).toBe(true)
    expect(isValidImageUrl('https://picsum.photos/200/300')).toBe(true)
  })

  it('accepts keyword-based image URLs and mixed-case extensions', () => {
    expect(isValidImageUrl('https://example.com/api?image=foo')).toBe(true)
    expect(isValidImageUrl('https://example.com/PHOTO/1')).toBe(true)
    expect(isValidImageUrl('https://example.com/file.JPEG')).toBe(true)
  })

  it('accepts ftp image URLs per current heuristic', () => {
    expect(isValidImageUrl('ftp://example.com/image.jpg')).toBe(true)
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



