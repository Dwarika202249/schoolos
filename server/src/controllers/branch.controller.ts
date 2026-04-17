import { Request, Response, NextFunction } from 'express';
import { Branch } from '../models/Branch.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';

export class BranchController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = new Branch({
        ...req.body,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });

      await branch.save();
      return ApiResponse.created(res, branch);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      const branches = await Branch.find(query);
      return ApiResponse.success(res, branches);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await Branch.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true }
      );

      if (!updated) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Branch not found');
      }

      return ApiResponse.success(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await Branch.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { 
          isDeleted: true, 
          deletedAt: new Date(), 
          deletedBy: req.jwtPayload?.userId 
        },
        { new: true }
      );

      if (!deleted) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Branch not found');
      }

      return ApiResponse.success(res, null, 'Branch deleted');
    } catch (error) {
      next(error);
    }
  }
}
