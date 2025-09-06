import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

declare global {
  namespace Express {
    interface Response {
      success: <T>(data: T, statusCode?: number, meta?: any) => void;
      error: (message: string, statusCode?: number, stack?: string) => void;
    }
  }
}

export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.success = <T>(data: T, statusCode: number = 200, meta?: any): void => {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(meta && { meta }),
    };
    res.status(statusCode).json(response);
  };

  res.error = (
    message: string,
    statusCode: number = 400,
    stack?: string
  ): void => {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(stack && { stack }),
      },
    };
    res.status(statusCode).json(response);
  };

  next();
};
