import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Se for um AppError, usa as propriedades definidas
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      message: error.message,
      details: error.details,
    });
  }

  // Prisma unique constraint (e.g., slug)
  const anyErr = error as any;
  if (anyErr?.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Registro já existe com os mesmos dados únicos',
      details: { target: anyErr.meta?.target },
    });
  }

  // Se for um erro de validação do Zod
  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Dados inválidos',
      details: (error as any).issues,
    });
  }

  // Erro interno do servidor
  console.error('Internal Server Error:', error);
  return res.status(500).json({
    error: 'InternalError',
    message: 'Erro interno do servidor',
  });
};
