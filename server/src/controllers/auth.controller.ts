import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User.model';
import { School } from '../models/School.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';

/**
 * Standard cookie options for refresh tokens.
 * HttpOnly + Secure + SameSite=Strict per security docs.
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  /**
   * POST /auth/register — Register new school tenant + owner
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerSchool(req.body);
      
      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      return ApiResponse.created(res, {
        school: result.school,
        user: result.owner,
        accessToken: result.tokens.accessToken,
      }, 'School registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login — Authenticate with email + password
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, schoolSlug } = req.body;
      const result = await AuthService.login(email, password, schoolSlug);

      res.cookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      return ApiResponse.success(res, {
        user: result.user,
        school: result.school,
        accessToken: result.tokens.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh — Refresh access token using HttpOnly cookie
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw createError(401, ErrorCodes.UNAUTHORIZED, 'No refresh token provided');
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      // Rotate refresh token
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      return ApiResponse.success(res, {
        accessToken: tokens.accessToken,
      }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout — Clear refresh token cookie
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken', { path: '/' });
      return ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me — Get current authenticated user + school context
   * Requires: authMiddleware
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.jwtPayload?.userId;
      if (!userId) {
        throw createError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      const user = await User.findOne({ 
        _id: userId, 
        isActive: true, 
        isDeleted: false 
      });

      if (!user) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'User not found');
      }

      // Fetch school context
      let school = null;
      if (user.schoolId) {
        school = await School.findOne({ 
          _id: user.schoolId, 
          isDeleted: false 
        }).lean();
      }

      return ApiResponse.success(res, {
        user: user.toSafeObject(),
        school,
      }, 'User retrieved');
    } catch (error) {
      next(error);
    }
  }
}
