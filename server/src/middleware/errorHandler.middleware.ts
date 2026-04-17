import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../utils/error.util';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  
  // Log error (in a real app, use a proper logger like winston/pino)
  console.error(`[ERROR] ${timestamp} - ${req.method} ${req.url}:`, error);

  // Default error
  let statusCode = 500;
  let code: string = ErrorCodes.INTERNAL_ERROR;
  let message = 'Internal Server Error';
  let details: any = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.errorCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 422;
    code = ErrorCodes.VALIDATION_ERROR;
    message = 'Validation Failed';
    details = error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp,
  });
};
