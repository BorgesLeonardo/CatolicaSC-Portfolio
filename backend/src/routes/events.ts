import { Router, Request, Response } from 'express'
import { requireApiAuth } from '../middleware/auth'
import { statsController } from '../controllers/stats.controller'

// In-memory list of SSE clients
const clients: Array<{ id: number; res: Response; userId?: string; ownerId?: string }> = []
let clientSeq = 0

export function broadcastEvent(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const c of clients) {
    try { c.res.write(payload) } catch {}
  }
}

export function broadcastToUser(userId: string, event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const c of clients) {
    if (c.userId === userId) {
      try { c.res.write(payload) } catch {}
    }
  }
}

export function broadcastToOwner(ownerId: string, event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const c of clients) {
    if (c.ownerId === ownerId) {
      try { c.res.write(payload) } catch {}
    }
  }
}

const router = Router()

// GET /api/events (SSE) — authenticated stream
router.get('/events', requireApiAuth, (req: Request, res: Response) => {
  // Allow CORS for SSE if needed
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const userId = (req as any).authUserId as string | undefined
  const ownerId = (req.query.ownerId as string) || undefined

  const id = ++clientSeq
  const client: { id: number; res: Response; userId?: string; ownerId?: string } = { id, res }
  if (userId !== undefined) client.userId = userId
  if (ownerId !== undefined) client.ownerId = ownerId
  clients.push(client)

  // Send a ping/hello event
  res.write(`event: connected\ndata: ${JSON.stringify({ id, userId, ownerId })}\n\n`)

  req.on('close', () => {
    const idx = clients.findIndex(c => c.id === id)
    if (idx >= 0) clients.splice(idx, 1)
  })
})

// Public platform metrics
router.get('/stats/platform', statsController.platformMetrics.bind(statsController))

export default router



