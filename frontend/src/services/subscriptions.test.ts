import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../utils/http', async () => {
  const actual = await vi.importActual<unknown>('../utils/http') as Record<string, unknown>
  return {
    ...actual,
    http: {
      get: vi.fn(() => Promise.resolve({ data: { page: 1, pageSize: 50, total: 1, items: [{ id: 's1', status: 'ACTIVE', priceBRL: 9.9, interval: 'MONTH', createdAt: new Date().toISOString(), projectId: 'p1', projectTitle: 'T', cancelable: true }] } })),
      delete: vi.fn(() => Promise.resolve({ data: { id: 's1', status: 'CANCELED' } })),
      defaults: { headers: {} },
      interceptors: { request: { use: () => {} }, response: { use: () => {} } },
    }
  }
})

describe('Subscriptions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list my subscriptions', async () => {
    const { subscriptionsService } = await import('./subscriptions')
    const res = await subscriptionsService.listMine(1, 50)
    expect(res.items.length).toBeGreaterThan(0)
  })

  it('should cancel a subscription immediately', async () => {
    const { subscriptionsService } = await import('./subscriptions')
    const res = await subscriptionsService.cancel('s1', false)
    expect(res.status).toBe('CANCELED')
  })
})


