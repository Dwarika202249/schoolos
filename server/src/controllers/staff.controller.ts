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

      // Auto-generate employeeId if not provided
      if (!profileData.employeeId || profileData.employeeId.trim() === '') {
        const _crypto = require('crypto');
        profileData.employeeId = `EMP-${_crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }

      // 1. Check if user already exists in this school
      const existingUser = await User.findOne({ schoolId, email });
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
      await user.save();

      // 3. Create Staff Profile
      const staffProfile = new StaffProfile({
        ...profileData,
        schoolId,
        branchId,
        userId: user._id,
        createdBy,
      });
      await staffProfile.save();

      // 4. Link staff profile back to user
      user.staffProfileId = staffProfile._id as any;
      await user.save();

      return ApiResponse.created(res, {
        user: user.toSafeObject(),
        profile: staffProfile,
      }, 'Staff member added successfully');
    } catch (error) {
      next(error);
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

  /**
   * PATCH /staff/:id/status — Toggle active status
   */
  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const staff = await StaffProfile.findOneAndUpdate(
        withTenantScope(req, { _id: id }),
        { isActive, updatedBy: req.jwtPayload?.userId },
        { new: true }
      );

      if (!staff) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Staff member not found');
      }

      // Also update related User's active status
      await User.findByIdAndUpdate(staff.userId, { isActive });

      return ApiResponse.success(res, staff, `Staff member ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /staff-attendance/sheet?date=...
   */
  static async getAttendanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const schoolId = req.tenantId;

      const queryDate = new Date(date as string);
      queryDate.setUTCHours(0, 0, 0, 0);

      // 1. Get all active staff
      const staff = await StaffProfile.find({
        schoolId,
        isActive: true,
        isDeleted: { $ne: true }
      }).populate('userId', 'firstName lastName email role avatarUrl');

      // 2. Get existing attendance for this date
      const mongoose = require('mongoose');
      const { StaffAttendance } = require('../models/StaffAttendance.model');
      const attendance = await StaffAttendance.find({
        schoolId: new mongoose.Types.ObjectId(schoolId as string),
        date: queryDate
      });

      return ApiResponse.success(res, {
        staff,
        attendance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /staff-attendance/mark
   */
  static async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, date, status, checkIn, checkOut, note, branchId } = req.body;
      const schoolId = req.tenantId;

      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0);

      const mongoose = require('mongoose');
      const { StaffAttendance } = require('../models/StaffAttendance.model');

      const result = await StaffAttendance.findOneAndUpdate(
        { 
          schoolId: new mongoose.Types.ObjectId(schoolId as string), 
          userId: new mongoose.Types.ObjectId(userId as string), 
          date: queryDate 
        },
        {
          branchId: new mongoose.Types.ObjectId(branchId as string),
          status,
          checkIn,
          checkOut,
          note,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      return ApiResponse.success(res, result, 'Staff attendance updated');
    } catch (error) {
      next(error);
    }
  }
}
