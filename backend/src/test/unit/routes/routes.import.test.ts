describe('routes modules import', () => {
  it('should import all routers', async () => {
    const modules = await Promise.all([
      import('../../../routes/categories'),
      import('../../../routes/checkout'),
      import('../../../routes/comments'),
      import('../../../routes/connect'),
      import('../../../routes/contributions'),
      import('../../../routes/events'),
      import('../../../routes/me.routes'),
      import('../../../routes/project-images'),
      import('../../../routes/project-videos'),
      import('../../../routes/projects'),
      import('../../../routes/subscriptions'),
      import('../../../routes/webhook'),
    ])
    for (const m of modules) {
      const router = (m as any).default
      expect(typeof router).toBe('function')
    }
  })
})


