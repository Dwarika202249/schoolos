import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { StaffProfile } from '../models/StaffProfile.model';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';

export class StaffController {
  /**
   * POST /staff — Create a new staff member (User + StaffProfile in a transaction)
   */
  static async createStaff(req: Request, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role,
        branchId,
        ...profileData
      } = req.body;

      const schoolId = req.tenantId;
      const createdBy = req.jwtPayload?.userId;

      // 1. Check if user already exists in this school
      const existingUser = await User.findOne({ schoolId, email }).session(session);
      if (existingUser) {
        throw createError(400, ErrorCodes.DUPLICATE_ENTRY, 'User with this email already exists in your school');
      }

      // 2. Create User account
      const user = new User({
        schoolId,
        branchId,
        email,
        passwordHash: password,
        firstName,
        lastName,
        role: role || 'STAFF',
        isActive: true,
        createdBy,
      });
      await user.save({ session });

      // 3. Create Staff Profile
      const staffProfile = new StaffProfile({
        ...profileData,
        schoolId,
        branchId,
        userId: user._id,
        createdBy,
      });
      await staffProfile.save({ session });

      // 4. Link staff profile back to user
      user.staffProfileId = staffProfile._id as any;
      await user.save({ session });

      await session.commitTransaction();

      return ApiResponse.created(res, {
        user: user.toSafeObject(),
        profile: staffProfile,
      }, 'Staff member added successfully');
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }

  /**
   * GET /staff — List all staff profiles (tenant-scoped)
   */
  static async getStaffList(req: Request, res: Response, next: NextFunction) {
    try {
      const { designation, department, branchId } = req.query;

      let filter: any = {};
      if (designation) filter.designation = designation;
      if (department) filter.department = department;
      if (branchId) filter.branchId = branchId;

      const query = withTenantScope(req, filter);
      const staff = await StaffProfile.find(query)
        .populate('userId', 'firstName lastName email role isActive avatarUrl')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, staff);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /staff/:id — Get single staff profile (tenant-scoped)
   */
  static async getStaffDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const staff = await StaffProfile.findOne(
        withTenantScope(req, { _id: id })
      ).populate('userId', 'firstName lastName email role isActive avatarUrl');

      if (!staff) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Staff member not found');
      }

      return ApiResponse.success(res, staff);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /staff/:id — Update staff profile (tenant-scoped)
   */
  static async updateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const staff = await StaffProfile.findOneAndUpdate(
        withTenantScope(req, { _id: id }),
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true, runValidators: true }
      );

      if (!staff) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Staff member not found');
      }

      return ApiResponse.success(res, staff, 'Staff profile updated');
    } catch (error) {
      next(error);
    }
  }
}
