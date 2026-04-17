import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.model';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';

export class StudentController {
  static async enroll(req: Request, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        email,
        password,
        firstName,
        lastName,
        ...studentData
      } = req.body;

      // 1. Create User account for student
      const user = new User({
        email,
        passwordHash: password || 'ChangeMe123', // Default password
        firstName,
        lastName,
        role: 'STUDENT',
        schoolId: req.tenantId,
        branchId: studentData.branchId,
        createdBy: req.jwtPayload?.userId,
      });

      await user.save({ session });

      // 2. Create Student profile
      const student = new Student({
        ...studentData,
        userId: user._id,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });

      await student.save({ session });

      // 3. Link student profile back to user
      user.studentProfileId = student._id as any;
      await user.save({ session });

      await session.commitTransaction();
      return ApiResponse.created(res, { student, user: user.toSafeObject() });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, sectionId, status } = req.query;
      let filter: any = {};
      
      if (classId) filter.classId = classId;
      if (sectionId) filter.sectionId = sectionId;
      if (status) filter.status = status;

      const query = withTenantScope(req, filter);
      const students = await Student.find(query)
        .populate('userId', 'firstName lastName email displayName avatarUrl')
        .populate('classId', 'grade section displayName')
        .sort({ admissionNumber: 1 });
      
      return ApiResponse.success(res, students);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const student = await Student.findOne({ _id: id, schoolId: req.tenantId })
        .populate('userId', 'firstName lastName email displayName avatarUrl')
        .populate('classId', 'grade section displayName')
        .populate('branchId', 'name code');

      if (!student) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Student not found');
      }

      return ApiResponse.success(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await Student.findOneAndUpdate(
        { _id: id, schoolId: req.tenantId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true }
      );

      if (!updated) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Student not found');
      }

      return ApiResponse.success(res, updated);
    } catch (error) {
      next(error);
    }
  }
}
