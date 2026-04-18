import { Request, Response, NextFunction } from 'express';
import { Subject } from '../models/Subject.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';

export class SubjectController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const subject = new Subject({
        ...req.body,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });

      await subject.save();
      return ApiResponse.created(res, subject, 'Subject created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      const subjects = await Subject.find(query).sort({ name: 1 });
      return ApiResponse.success(res, subjects);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subject = await Subject.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true, runValidators: true }
      );

      if (!subject) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Subject not found');
      }

      return ApiResponse.success(res, subject, 'Subject updated');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 1. Dependency Guard: Check if subject is assigned to any class
      const ClassSection = (await import('../models/ClassSection.model')).ClassSection;
      const inUse = await ClassSection.findOne({ 
        schoolId: req.tenantId, 
        subjectIds: id,
        isDeleted: false 
      });

      if (inUse) {
        throw createError(
          400, 
          ErrorCodes.VALIDATION_ERROR, 
          "Cannot delete subject. It is currently assigned to one or more classes."
        );
      }

      const subject = await Subject.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { 
          isDeleted: true, 
          deletedAt: new Date(), 
          deletedBy: req.jwtPayload?.userId 
        },
        { new: true }
      );

      if (!subject) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Subject not found');
      }

      return ApiResponse.success(res, null, 'Subject deleted');
    } catch (error) {
      next(error);
    }
  }
}
