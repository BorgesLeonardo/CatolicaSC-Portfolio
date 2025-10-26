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
  try {
    (req as any)?.log?.error?.({ err: error }, 'internal_server_error');
  } catch {
    // last resort fallback when logger is not attached
  }
  // Ensure console.error is called for visibility in tests and local dev
  console.error('Internal Server Error:', error)
  const response: Record<string, unknown> = {
    error: 'InternalError',
    message: 'Erro interno do servidor',
  };
  if (process.env.NODE_ENV !== 'production') {
    response.details = error.message;
  }
  return res.status(500).json(response);
};
