describe('utils/stripeClient', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('throws if STRIPE_SECRET_KEY is not defined', () => {
    delete process.env.STRIPE_SECRET_KEY
    jest.resetModules()
    jest.unmock('../../../utils/stripeClient')
    expect(() => {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../../../utils/stripeClient')
      })
    }).toThrow(/STRIPE_SECRET_KEY is not defined/)
  })

  it('exports stripe instance when env is present', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    jest.resetModules()
    jest.unmock('../../../utils/stripeClient')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../../../utils/stripeClient')
    expect(mod.stripe).toBeDefined()
  })
})


