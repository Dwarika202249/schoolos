import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError, ErrorCodes } from '../utils/error.util';

/**
 * Authentication Middleware
 * 
 * Verifies JWT access token from Authorization header.
 * Populates req.jwtPayload, req.userId, and req.userRole.
 * 
 * Must run BEFORE tenantContextMiddleware and rbacMiddleware.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      schoolId: string;
      role: string;
      branchId?: string;
    };

    // Populate the global Express.Request augmented fields
    req.jwtPayload = decoded;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(createError(401, ErrorCodes.TOKEN_EXPIRED, 'Access token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(createError(401, ErrorCodes.TOKEN_INVALID, 'Invalid access token'));
    } else {
      next(error);
    }
  }
};
