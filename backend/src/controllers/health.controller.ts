import { Request, Response } from 'express';

export class HealthController {
  async alive(req: Request, res: Response) {
    return res.json({ ok: true });
  }
}
