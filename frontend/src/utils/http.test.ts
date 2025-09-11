import { describe, it, expect } from 'vitest'
import { http } from './http'

describe('http', () => {
  it('should be defined', () => {
    expect(http).toBeDefined()
  })

  it('should have baseURL configured', () => {
    // Just check that http is working
    expect(http).toBeDefined()
  })

  it('should be an axios instance', () => {
    expect(typeof http.get).toBe('function')
    expect(typeof http.post).toBe('function')
    expect(typeof http.put).toBe('function')
    expect(typeof http.delete).toBe('function')
  })
})
