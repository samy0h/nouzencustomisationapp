import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof z.ZodError) {
    const message = err.issues.map(issue => issue.message).join(', ');
    return res.status(400).json({
      status: 'error',
      message: message || 'Validation failed',
    });
  }

  console.error('❌ Unexpected error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
