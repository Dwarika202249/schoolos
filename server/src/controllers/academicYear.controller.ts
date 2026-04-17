import { Request, Response, NextFunction } from 'express';
import { AcademicYear } from '../models/AcademicYear.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';

export class AcademicYearController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // If setting as current, unset others
      if (req.body.isCurrent) {
        await AcademicYear.updateMany(
          { schoolId: req.tenantId, isCurrent: true },
          { isCurrent: false }
        );
      }

      const academicYear = new AcademicYear({
        ...req.body,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });

      await academicYear.save();
      return ApiResponse.created(res, academicYear);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      const years = await AcademicYear.find(query).sort({ startDate: -1 });
      return ApiResponse.success(res, years);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (req.body.isCurrent) {
        await AcademicYear.updateMany(
          { schoolId: req.tenantId, _id: { $ne: id }, isCurrent: true },
          { isCurrent: false }
        );
      }

      const updated = await AcademicYear.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true }
      );

      if (!updated) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Academic year not found');
      }

      return ApiResponse.success(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await AcademicYear.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { 
          isDeleted: true, 
          deletedAt: new Date(), 
          deletedBy: req.jwtPayload?.userId 
        },
        { new: true }
      );

      if (!deleted) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Academic year not found');
      }

      return ApiResponse.success(res, null, 'Academic year deleted');
    } catch (error) {
      next(error);
    }
  }
}
