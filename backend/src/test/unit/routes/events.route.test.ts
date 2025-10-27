import request from 'supertest'
import express from 'express'

describe('events route', () => {
  it('should register SSE client and respond with connected event', async () => {
    process.env.TEST_BYPASS_AUTH = 'true'
    const app = express()
    const router = (await import('../../../routes/events')).default
    app.use(router)

    await new Promise<void>((resolve, reject) => {
      const req = request(app)
        .get('/events?ownerId=o1')
        .set({ 'Accept': 'text/event-stream', 'x-test-auth-bypass': 'true', 'x-test-user-id': 'u1' })
        .buffer(true)
        .parse((res: any, cb: any) => {
          let saw = false
          res.on('data', (chunk: any) => {
            const text = chunk.toString()
            if (text.includes('event: connected')) {
              try {
                expect(res.statusCode).toBe(200)
                expect(String(res.headers['content-type'] || '')).toMatch(/text\/event-stream/)
                expect(text).toContain('"userId":"u1"')
                expect(text).toContain('"ownerId":"o1"')
                saw = true
              } catch (e) {
                cb(e)
                reject(e)
                return
              }
              ;(req as any).abort()
              cb(null, Buffer.alloc(0))
              resolve()
            }
          })
          res.on('end', () => { if (!saw) reject(new Error('No connected event')) })
          res.on('error', (err: any) => { reject(err) })
        })
        .end((err: any) => {
          if (err && (err.code !== 'ABORTED' && err.message !== 'aborted')) {
            reject(err)
          }
        })
    })
  })
})


