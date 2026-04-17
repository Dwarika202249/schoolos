import { Request, Response, NextFunction } from "express";
import { School } from "../models/School.model";
import { Branch } from "../models/Branch.model";
import { ApiResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export class TenantController {
  /**
   * Update school-wide settings (Name, Branding, Contact)
   * Also propagates institutional profile changes to the HQ Branch.
   */
  static async updateSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.jwtPayload;
      if (!jwtPayload) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required");
      }
      const schoolId = jwtPayload.schoolId;

      const {
        name,
        address,
        phone,
        email,
        website,
        branding,
        boardAffiliation,
        mediumOfInstruction,
        academicYearStartMonth,
      } = req.body;

      // 1. Update the School document
      const updatedSchool = await School.findByIdAndUpdate(
        schoolId,
        {
          $set: {
            name,
            address,
            phone,
            email,
            website,
            branding,
            boardAffiliation,
            mediumOfInstruction,
            academicYearStartMonth,
          },
        },
        { new: true, runValidators: true },
      );

      if (!updatedSchool) {
        throw new AppError(404, "NOT_FOUND", "School not found");
      }

      // 2. Synchronization Logic: Deep sync institutional profile to the HQ Branch
      // This ensures the "Main Campus" card reflects the unified address schema.
      if (address || phone || email) {
        await Branch.findOneAndUpdate(
          { schoolId, isHeadquarters: true },
          {
            $set: {
              // Deep sync the address object if provided
              ...(address && { address }),
              phone: phone || updatedSchool.phone,
              email: email || updatedSchool.email,
            }
          }
        );
      }

      return ApiResponse.success(
        res,
        updatedSchool,
        "School settings updated and synced to HQ branch",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public/general settings for the current school
   */
  static async getSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.jwtPayload;
      if (!jwtPayload) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required");
      }
      const school = await School.findById(jwtPayload.schoolId);
      if (!school) {
        throw new AppError(404, "NOT_FOUND", "School not found");
      }

      return ApiResponse.success(res, school, "School details retrieved");
    } catch (error) {
      next(error);
    }
  }
}
