import express, { Request, Response, NextFunction } from 'express';
import { School } from '../models/School.model';
import { createError, ErrorCodes } from '../utils/error.util';

/**
 * Validates and injects tenant context into the request.
 * Should run after authMiddleware where req.jwtPayload is populated.
 */
export const tenantContextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schoolId = req.jwtPayload?.schoolId;

    if (!schoolId) {
      throw createError(403, ErrorCodes.FORBIDDEN, 'Tenant context missing in token');
    }

    // Validate that the school exists and is active
    const school = await School.findOne({ 
      _id: schoolId, 
      isDeleted: false 
    }).lean();

    if (!school) {
      throw createError(404, ErrorCodes.TENANT_NOT_FOUND, 'School not found');
    }

    if (school.status === 'INACTIVE' || school.status === 'SUSPENDED') {
      throw createError(403, ErrorCodes.TENANT_INACTIVE, `School is ${school.status}`);
    }

    // Inject tenant context into request
    req.tenantId = schoolId;
    req.tenantSlug = school.slug;
    
    if (req.jwtPayload?.branchId) {
      req.branchId = req.jwtPayload.branchId;
    }

    next();
  } catch (error) {
    next(error);
  }
};
