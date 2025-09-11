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

  it('retorna 401 quando ausente', async () => {
    const req = { headers: {} } as unknown as Request
    const res = makeRes()
    
    requireApiAuth(req, res, mockNext)
    
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('retorna 401 quando userId é null', async () => {
    const req = { 
      headers: { authorization: 'Bearer token_fake' },
      auth: { userId: null }
    } as unknown as Request
    const res = makeRes()
    
    // Mock getAuth para retornar null
    const { getAuth } = require('@clerk/express')
    getAuth.mockReturnValueOnce({ userId: null })
    
    requireApiAuth(req, res, mockNext)
    
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
