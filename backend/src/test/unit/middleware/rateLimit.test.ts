// Mock express-rate-limit to capture options
const calls: any[] = []
jest.mock('express-rate-limit', () => {
  return jest.fn((opts: any) => {
    calls.push(opts)
    return function rateLimitMiddleware() { /* no-op */ }
  })
})

describe('rateLimit middlewares', () => {
  beforeEach(() => {
    calls.length = 0
    jest.resetModules()
  })

  it('should create apiLimiter, createProjectLimiter and createWithdrawalLimiter with expected options', async () => {
    const rateLimit = (await import('express-rate-limit')).default as any
    expect(typeof rateLimit).toBe('function')

    // Import module under test (will call rateLimit 3 times)
    const mod = await import('../../../middleware/rateLimit')
    expect(mod).toHaveProperty('apiLimiter')
    expect(mod).toHaveProperty('createProjectLimiter')
    expect(mod).toHaveProperty('createWithdrawalLimiter')

    expect(calls.length).toBe(3)

    const [api, createProject, createWithdrawal] = calls

    expect(api.windowMs).toBe(15 * 60 * 1000)
    expect(api.max).toBe(300)
    expect(api.standardHeaders).toBe(true)
    expect(api.legacyHeaders).toBe(false)
    expect(api.message).toEqual({ error: 'TooManyRequests', message: expect.any(String) })
    expect(typeof api.keyGenerator).toBe('function')

    expect(createProject.windowMs).toBe(60_000)
    expect(createProject.max).toBe(10)
    expect(createProject.standardHeaders).toBe(true)
    expect(createProject.legacyHeaders).toBe(false)
    expect(createProject.message).toEqual({ error: 'TooManyRequests', message: expect.any(String) })

    expect(createWithdrawal.windowMs).toBe(24 * 60 * 60 * 1000)
    expect(createWithdrawal.max).toBe(1)
    expect(createWithdrawal.standardHeaders).toBe(true)
    expect(createWithdrawal.legacyHeaders).toBe(false)
    expect(createWithdrawal.message).toEqual({ error: 'TooManyRequests', message: expect.any(String) })
    expect(typeof createWithdrawal.keyGenerator).toBe('function')
  })
})


