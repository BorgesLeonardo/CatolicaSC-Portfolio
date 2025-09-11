import { Request, Response, NextFunction } from 'express'
import { requireApiAuth } from './auth'

const mockNext = jest.fn() as NextFunction

const makeRes = () => {
  const res = {} as Response
  ;(res.status as any) = jest.fn().mockReturnValue(res)
  ;(res.json as any) = jest.fn().mockReturnValue(res)
  return res
}

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('segue quando Bearer token presente', async () => {
    const req = { 
      headers: { authorization: 'Bearer token_fake' },
      auth: { userId: 'user_test_id' }
    } as unknown as Request
    const res = makeRes()
    
    requireApiAuth(req, res, mockNext)
    
    expect(mockNext).toHaveBeenCalled()
    expect((req as any).authUserId).toBe('user_test_id')
  })

  it('lança AppError quando ausente', async () => {
    const req = { headers: {} } as unknown as Request
    const res = makeRes()
    
    expect(() => requireApiAuth(req, res, mockNext)).toThrow('Unauthorized')
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('lança AppError quando userId é null', async () => {
    const req = { 
      headers: { authorization: 'Bearer token_fake' },
      auth: { userId: null }
    } as unknown as Request
    const res = makeRes()
    
    // Mock getAuth para retornar null
    const { getAuth } = require('@clerk/express')
    getAuth.mockReturnValueOnce({ userId: null })
    
    expect(() => requireApiAuth(req, res, mockNext)).toThrow('Unauthorized')
    expect(mockNext).not.toHaveBeenCalled()
  })
})
