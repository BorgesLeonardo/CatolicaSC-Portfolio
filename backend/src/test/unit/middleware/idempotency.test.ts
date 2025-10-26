import { idempotencyMiddleware } from '../../../middleware/idempotency'

// Mock Prisma
jest.mock('../../../infrastructure/prisma', () => ({
  prisma: {
    idempotencyKey: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const { prisma } = jest.requireMock('../../../infrastructure/prisma') as any

function mockReqRes(method: string, headers: Record<string, string> = {}, body: any = {}, baseUrl = '/api/projects', path = '/') {
  const req: any = {
    method,
    baseUrl,
    path,
    body,
    header: (name: string) => headers[name] || headers[name.toLowerCase()],
  }

  const resJson = jest.fn()
  const resSend = jest.fn()
  const resStatus = jest.fn().mockImplementation(function (this: any, code: number) {
    ;(this as any).statusCode = code
    return this
  })

  const res: any = {
    statusCode: 200,
    json: resJson,
    send: resSend,
    status: resStatus,
  }

  const next = jest.fn()
  return { req, res, next, resJson, resSend, resStatus }
}

describe('idempotencyMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should skip for non-modifying methods', async () => {
    const { req, res, next } = mockReqRes('GET')
    await idempotencyMiddleware(req as any, res as any, next as any)
    expect(next).toHaveBeenCalled()
    expect(prisma.idempotencyKey.findUnique).not.toHaveBeenCalled()
  })

  it('should proceed when Idempotency-Key header is missing', async () => {
    const { req, res, next } = mockReqRes('POST')
    await idempotencyMiddleware(req as any, res as any, next as any)
    expect(next).toHaveBeenCalled()
    expect(prisma.idempotencyKey.findUnique).not.toHaveBeenCalled()
  })

  it('should return stored response when key exists with same hash and endpoint', async () => {
    const body = { a: 1 }
    const { req, res, next, resJson } = mockReqRes('POST', { 'Idempotency-Key': 'abc' }, body, '/api/projects', '/')
    // Recompute hash the same way as middleware does
    const crypto = await import('crypto')
    const requestHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex')
    prisma.idempotencyKey.findUnique.mockResolvedValue({
      key: 'abc',
      endpoint: '/api/projects/',
      requestHash,
      responseStatus: 201,
      responseBody: JSON.stringify({ ok: true }),
    })

    await idempotencyMiddleware(req as any, res as any, next as any)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(201)
    expect(resJson).toHaveBeenCalledWith({ ok: true })
  })

  it('should 409 on key reuse with different payload/endpoint', async () => {
    const { req, res, resJson, next } = mockReqRes('POST', { 'Idempotency-Key': 'key-1' }, { a: 2 }, '/api/other', '/x')
    prisma.idempotencyKey.findUnique.mockResolvedValue({
      key: 'key-1',
      endpoint: '/api/projects/',
      requestHash: 'different',
    })

    await idempotencyMiddleware(req as any, res as any, next as any)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(409)
    expect(resJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'IdempotencyConflict' }))
  })

  it('should create key and store response on first successful response', async () => {
    const { req, res, next } = mockReqRes('POST', { 'Idempotency-Key': 'first' }, { hello: 'world' }, '/api/projects', '/')
    prisma.idempotencyKey.findUnique.mockResolvedValue(null)
    prisma.idempotencyKey.create.mockResolvedValue({ key: 'first' })
    prisma.idempotencyKey.update.mockResolvedValue({})

    await idempotencyMiddleware(req as any, res as any, next as any)

    // Simulate downstream handler writing a response
    res.status(202)
    ;(res as any).json({ ok: true })

    expect(prisma.idempotencyKey.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Object) }))
    expect(prisma.idempotencyKey.update).toHaveBeenCalledWith({
      where: { key: 'first' },
      data: expect.objectContaining({ responseStatus: 202, responseBody: JSON.stringify({ ok: true }) }),
    })
  })
})


