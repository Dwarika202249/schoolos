import { Request, Response, NextFunction } from 'express';
import { ClassSection } from '../models/ClassSection.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';

export class ClassSectionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const classSection = new ClassSection({
        ...req.body,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });

      await classSection.save();
      return ApiResponse.created(res, classSection);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId, branchId } = req.query;
      let filter: any = {};
      
      if (academicYearId) filter.academicYearId = academicYearId;
      if (branchId) filter.branchId = branchId;

      const query = withTenantScope(req, filter);
      const classes = await ClassSection.find(query).sort({ grade: 1, section: 1 });
      
      return ApiResponse.success(res, classes);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ClassSection.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true }
      );

      if (!updated) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Class/Section not found');
      }

      return ApiResponse.success(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // TODO: Once Student model is ready, check for active enrollments
      // For now, Class is a top-level entity, but we keep it safe.

      const deleted = await ClassSection.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { 
          isDeleted: true, 
          deletedAt: new Date(), 
          deletedBy: req.jwtPayload?.userId 
        },
        { new: true }
      );

      if (!deleted) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Class/Section not found');
      }

      return ApiResponse.success(res, null, 'Class/Section deleted');
    } catch (error) {
      next(error);
    }
  }
}
