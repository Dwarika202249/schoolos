import { Request, Response, NextFunction } from 'express';
import { ClassSection } from '../models/ClassSection.model';
import { Timetable } from '../models/Timetable.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import mongoose from 'mongoose';
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

      // ── Scoping for Teachers ──────────────────────────────────────────
      if (req.jwtPayload?.role === 'TEACHER') {
          const teacherId = new mongoose.Types.ObjectId(req.jwtPayload.userId as string);
          
          // Find classes where teacher is assigned (Class Teacher or Timetable)
          const timetableClasses = await Timetable.find({ schoolId: req.tenantId, teacherId }).distinct('classId');
          
          // Combine with classes where they are Class Teacher
          filter.$or = [
              { classId: { $in: timetableClasses } },
              { classTeacherId: teacherId }
          ];

          // Special case: In the model, 'filter' is already used for query.
          // Since ClassSection model's local fields for filtering are grade/section,
          // we use the combined assignment check.
          filter = {
             ...filter,
             $or: [
                { _id: { $in: timetableClasses } },
                { classTeacherId: teacherId }
             ]
          };
          delete filter.classId; // Remove the temporary key if any
      }
      // ──────────────────────────────────────────────────────────────────

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
