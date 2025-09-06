import { Request, Response } from 'express';

export const getDevStatus = (req: Request, res: Response): void => {
  res.success({ status: 'ok' });
};
