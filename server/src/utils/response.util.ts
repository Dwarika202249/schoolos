import { Response } from 'express';

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
      timestamp: new Date().toISOString(),
    });
  }
  
  static created<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
    return this.success(res, data, message, 201);
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
      timestamp: new Date().toISOString(),
    });
  }
}
