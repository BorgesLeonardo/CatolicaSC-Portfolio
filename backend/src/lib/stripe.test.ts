describe('Stripe Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws error when STRIPE_SECRET_KEY is not configured', () => {
    delete process.env.STRIPE_SECRET_KEY

    expect(() => {
      require('./stripe')
    }).toThrow('STRIPE_SECRET_KEY not configured')
  })

  it('creates Stripe instance when STRIPE_SECRET_KEY is configured', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'

    const { stripe } = require('./stripe')

    expect(stripe).toBeDefined()
    expect(typeof stripe).toBe('object')
  })
})
