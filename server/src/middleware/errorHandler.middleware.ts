import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../utils/error.util';
import { ZodError } from 'zod';
import crypto from 'crypto';

/**
 * Global error handler — MUST be the last middleware registered.
 * Converts all errors into the standard ErrorResponse shape from docs.
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = `req_${crypto.randomBytes(6).toString('hex')}`;
  const timestamp = new Date().toISOString();
  
  // Log error (in production, use a structured logger like pino/winston)
  console.error(`[ERROR] ${requestId} ${timestamp} - ${req.method} ${req.url}:`, error.message);

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
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (error.name === 'CastError') {
    // Mongoose bad ObjectId
    statusCode = 400;
    code = ErrorCodes.VALIDATION_ERROR;
    message = 'Invalid ID format';
  } else if ((error as any).code === 11000) {
    // Mongoose duplicate key
    statusCode = 409;
    code = ErrorCodes.DUPLICATE_ENTRY;
    message = 'Duplicate entry — resource already exists';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    requestId,
    timestamp,
  });
};
