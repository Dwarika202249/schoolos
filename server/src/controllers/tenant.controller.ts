import { Request, Response, NextFunction } from "express";
import { School } from "../models/School.model";
import { ApiResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

export class TenantController {
  /**
   * Update school-wide settings (Name, Branding, Contact)
   * Only accessible by OWNER
   */
  static async updateSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.jwtPayload;
      if (!jwtPayload) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required");
      }
      const schoolId = jwtPayload.schoolId;

      // Whitelist fields to avoid privilege escalation (manual maxBranches etc)
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

      return ApiResponse.success(
        res,
        updatedSchool,
        "School settings updated successfully",
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
