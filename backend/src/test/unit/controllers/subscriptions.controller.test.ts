import { SubscriptionsController } from '../../../controllers/subscriptions.controller'

describe('SubscriptionsController', () => {
  it('createCheckout returns 201 with payload when body valid', async () => {
    const mockService = { createCheckout: jest.fn().mockResolvedValue({ checkoutUrl: 'u', subscriptionId: 's' }) } as any
    const controller = new SubscriptionsController(mockService)
    const req: any = { body: { projectId: 'ckv3o9j8c00000123abcdxyz' }, authUserId: 'u1' }
    const json = jest.fn()
    const status = jest.fn().mockImplementation(function (this: any) { return this })
    const res: any = { json, status }
    const next = jest.fn()
    await controller.createCheckout(req as any, res as any, next as any)
    expect(status).toHaveBeenCalledWith(201)
    expect(json).toHaveBeenCalledWith({ checkoutUrl: 'u', subscriptionId: 's' })
    expect(next).not.toHaveBeenCalled()
  })

  it('createCheckout yields validation error on invalid body', async () => {
    const mockService = { createCheckout: jest.fn() } as any
    const controller = new SubscriptionsController(mockService)
    const req: any = { body: { projectId: 'not-a-cuid' }, authUserId: 'u1' }
    const json = jest.fn()
    const status = jest.fn().mockImplementation(function (this: any) { return this })
    const res: any = { json, status }
    const next = jest.fn()
    await controller.createCheckout(req as any, res as any, next as any)
    expect(next).toHaveBeenCalled()
  })
})


