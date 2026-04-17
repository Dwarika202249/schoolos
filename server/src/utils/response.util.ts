import { Response } from 'express';
import crypto from 'crypto';

/**
 * Generates a short unique request ID for tracing.
 */
const generateRequestId = (): string => {
  return `req_${crypto.randomBytes(6).toString('hex')}`;
};

/**
 * Standardized API response utility.
 * All responses include: success, message, data, requestId, timestamp.
 */
export class ApiResponse {
  static success<T>(
    res: Response, 
    data: T, 
    message: string = 'Success',
    statusCode: number = 200,
    meta?: object
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
    });
  }
  
  static created<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
  
  static error(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: { 
        code, 
        message, 
        ...(details ? { details } : {}) 
      },
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
    });
  }
}
