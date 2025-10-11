describe('lib/stripe', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('throws if STRIPE_SECRET_KEY not configured', () => {
    delete process.env.STRIPE_SECRET_KEY
    jest.resetModules()
    jest.unmock('../../../lib/stripe')
    expect(() => {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../../../lib/stripe')
      })
    }).toThrow(/STRIPE_SECRET_KEY not configured/)
  })

  it('exports stripe when env is present', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    jest.resetModules()
    jest.unmock('../../../lib/stripe')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../../../lib/stripe')
    expect(mod.stripe).toBeDefined()
  })
})


