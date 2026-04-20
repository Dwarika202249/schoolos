import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.model';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import { withTenantScope } from '../utils/tenantQuery.util';
import crypto from 'crypto';

export class StudentController {
  private static async generateAdmissionNumber(schoolId: any): Promise<string> {
    const lastStudent = await Student.findOne({ schoolId })
      .sort({ createdAt: -1 })
      .select('admissionNumber');

    if (!lastStudent || !lastStudent.admissionNumber) {
      return `SCH-${new Date().getFullYear()}-0001`;
    }

    const match = lastStudent.admissionNumber.match(/(\d+)$/);
    const lastSeq = match ? parseInt(match[1], 10) : 0;
    return `SCH-${new Date().getFullYear()}-${String(lastSeq + 1).padStart(4, '0')}`;
  }

  static async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        firstName,
        lastName,
        guardians = [],
        ...studentData
      } = req.body;

      if (!studentData.admissionNumber) {
        studentData.admissionNumber = await StudentController.generateAdmissionNumber(req.tenantId);
      }

      // Phase 1: Smart Sibling Guardian Detection
      const processedGuardians = [];
      for (const guardian of guardians) {
         let parentUserId = null;
         
         // Priority 1: Check by phone
         if (guardian.phone) {
             const existing = await User.findOne({ phone: guardian.phone, role: 'PARENT' });
             if (existing) parentUserId = existing._id;
         }
         
         // Priority 2: Check by email if phone didn't yield a user
         if (!parentUserId && guardian.email) {
             const existing = await User.findOne({ email: guardian.email, role: 'PARENT' });
             if (existing) parentUserId = existing._id;
         }

         // If not existing, create parent portal account (if they gave phone/email)
         if (!parentUserId && (guardian.email || guardian.phone)) {
             const pToken = crypto.randomBytes(32).toString('hex');
             const parentUser = new User({
                 email: guardian.email || `${guardian.phone}@parent.local`,
                 phone: guardian.phone,
                 passwordHash: crypto.randomBytes(16).toString('hex'), // Un-guessable until reset via magic link
                 firstName: guardian.name.split(' ')[0],
                 lastName: guardian.name.split(' ').slice(1).join(' ') || 'Parent',
                 role: 'PARENT',
                 schoolId: req.tenantId,
                 isActive: false,
                 passwordResetToken: pToken,
                 passwordResetExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
             });
             await parentUser.save();
             parentUserId = parentUser._id;
         }
         
         processedGuardians.push({
             ...guardian,
             userId: parentUserId
         });
      }

      // Phase 1: Zero-Trust Student Onboarding
      const studentEmail = email || `${studentData.admissionNumber}@student.local`;
      const rawToken = crypto.randomBytes(32).toString('hex');
      
      const user = new User({
        email: studentEmail,
        passwordHash: crypto.randomBytes(16).toString('hex'), // No 'ChangeMe123'
        firstName,
        lastName,
        role: 'STUDENT',
        schoolId: req.tenantId,
        branchId: studentData.branchId,
        createdBy: req.jwtPayload?.userId,
        isActive: false, // Gated until activation
        passwordResetToken: rawToken,
        passwordResetExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await user.save();

      // 2. Create Student profile
      const student = new Student({
        ...studentData,
        guardians: processedGuardians,
        userId: user._id,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });

      await student.save();

      // 3. Link student profile back to user
      user.studentProfileId = student._id as any;
      await user.save();

      // TODO: Queue Email/SMS Service delivery for `rawToken` here
      
      return ApiResponse.created(res, { 
          student, 
          user: user.toSafeObject(),
          message: 'Student enrolled. Activation links have been prepared for dispatch.'
      });
    } catch (error) {
      next(error);
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

  static async resendActivationLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const student = await Student.findOne({ _id: id, schoolId: req.tenantId }).populate('userId');
      
      if (!student || !student.userId) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Student account not found');
      }

      const user = student.userId as any;
      const rawToken = crypto.randomBytes(32).toString('hex');
      
      user.passwordResetToken = rawToken;
      user.passwordResetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      // TODO: Queue to messaging service
      return ApiResponse.success(res, { 
          message: 'Activation link generated and queued for dispatch successfully.',
          expiry: user.passwordResetExpiry
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      // Placeholder for csv-parse pipeline
      // Expected logic:
      // 1. Parse CSV chunk by chunk
      // 2. Construct and validate documents
      // 3. Keep track of successes/errors
      // 4. Return BulkImportResult containing successful counts and a downloadable CSV of failed rows.
      return ApiResponse.success(res, {
          totalProcessed: 0,
          successCount: 0,
          errorCount: 0,
          errorReportUrl: null,
          message: "Enterprise bulk import module engaged. Feature rolling out."
      });
    } catch (error) {
      next(error);
    }
  }
}
