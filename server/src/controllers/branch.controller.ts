import { Request, Response, NextFunction } from "express";
import { Branch } from "../models/Branch.model";
import { School } from "../models/School.model";
import { ApiResponse } from "../utils/response.util";
import { createError, ErrorCodes } from "../utils/error.util";
import { withTenantScope } from "../utils/tenantQuery.util";

export class BranchController {
  /**
   * Create new branch with license enforcement (maxBranches check)
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.tenantId;

      // 1. Enforcement: Check max branches limit
      const [school, branchCount] = await Promise.all([
        School.findById(schoolId),
        Branch.countDocuments({ schoolId, isDeleted: false }),
      ]);

      if (!school) {
        throw createError(404, ErrorCodes.TENANT_NOT_FOUND, "School not found");
      }

      if (branchCount >= school.maxBranches) {
        throw createError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `Branch limit reached (${school.maxBranches}). Upgrade your plan to add more campuses.`,
        );
      }

      // 2. HQ Uniqueness: If marking as HQ, unset others
      if (req.body.isHeadquarters) {
        await Branch.updateMany(
          { schoolId, isHeadquarters: true },
          { isHeadquarters: false },
        );
      }

      const branch = new Branch({
        ...req.body,
        schoolId,
        createdBy: req.jwtPayload?.userId,
      });

      await branch.save();
      return ApiResponse.created(res, branch, "Branch created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      // Sort HQ first, then recently created
      const branches = await Branch.find(query).sort({
        isHeadquarters: -1,
        createdAt: -1,
      });
      return ApiResponse.success(res, branches, "Branches retrieved");
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      // HQ Uniqueness logic for update
      if (req.body.isHeadquarters) {
        await Branch.updateMany(
          { schoolId, _id: { $ne: id }, isHeadquarters: true },
          { isHeadquarters: false },
        );
      }

      const updated = await Branch.findOneAndUpdate(
        { _id: id, schoolId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true, runValidators: true },
      );

      if (!updated) {
        throw createError(404, ErrorCodes.NOT_FOUND, "Branch not found");
      }

      return ApiResponse.success(res, updated, "Branch updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Safe Delete: Protects the Headquarters from accidental deletion
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      // 1. Enforcement: Prevent HQ deletion
      const branchToDrop = await Branch.findOne({ _id: id, schoolId });
      if (!branchToDrop) {
        throw createError(404, ErrorCodes.NOT_FOUND, "Branch not found");
      }

      if (branchToDrop.isHeadquarters) {
        throw createError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Cannot delete the Headquarters branch. Please assign HQ status to another branch first.",
        );
      }

      const deleted = await Branch.findOneAndUpdate(
        { _id: id, schoolId },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.jwtPayload?.userId,
        },
        { new: true },
      );

      return ApiResponse.success(res, null, "Branch deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
