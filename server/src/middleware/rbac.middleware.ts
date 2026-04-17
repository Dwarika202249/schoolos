import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';
import { createError, ErrorCodes } from '../utils/error.util';

type RoleArray = Array<typeof UserRole[keyof typeof UserRole]>;

/**
 * Factory function — creates route-specific RBAC guard.
 * 
 * Usage: router.get('/payroll', requireRoles([UserRole.OWNER, UserRole.ADMIN]), handler)
 */
export const requireRoles = (allowedRoles: RoleArray) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.jwtPayload?.role;

    if (!userRole || !allowedRoles.includes(userRole as any)) {
      throw createError(
        403,
        ErrorCodes.FORBIDDEN,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }
    next();
  };
};

// ─── Convenience Guards ───────────────────────────────────────────────────────
export const requireOwner = requireRoles([UserRole.OWNER]);
export const requireAdmin = requireRoles([UserRole.OWNER, UserRole.ADMIN]);
export const requireTeacher = requireRoles([UserRole.OWNER, UserRole.ADMIN, UserRole.TEACHER]);
export const requireAnyStaff = requireRoles([UserRole.OWNER, UserRole.ADMIN, UserRole.TEACHER, UserRole.STAFF]);
