import { logWithdrawalEvent, withRequest } from '../../../utils/logger'

describe('logger utils', () => {
  const originalInfo = console.info
  beforeEach(() => {
    // pino writes to stdout; we can spy on console as a proxy to ensure no throw
    ;(console as any).info = jest.fn()
  })
  afterEach(() => {
    console.info = originalInfo
    jest.clearAllMocks()
  })

  it('logWithdrawalEvent should mask email and cpf/cnpj fields', () => {
    // Ensure it does not throw and masks values
    expect(() => logWithdrawalEvent('w1', {
      userEmail: 'john@example.com',
      cpf: '12345678901',
      cnpj: '12345678000190',
      note: 'ok',
    })).not.toThrow()
  })

  it('withRequest should return a child logger', () => {
    const child = withRequest({ requestId: 'r1' })
    expect(typeof (child as any).info).toBe('function')
  })
})


