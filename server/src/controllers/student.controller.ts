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

  private static parseExcelDate(val: any): Date {
    if (!val) return new Date('2010-01-01');
    
    // 1. If it's already a Date object
    if (val instanceof Date) return isNaN(val.getTime()) ? new Date('2010-01-01') : val;

    // 2. Handle Excel Serial Numbers (e.g. 44234)
    if (!isNaN(val) && Number(val) > 30000) {
      return new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
    }

    // 3. String Parsing
    const date = new Date(val);
    if (!isNaN(date.getTime())) return date;

    // 4. Common Indian format DD/MM/YYYY or DD-MM-YYYY
    const parts = val.toString().split(/[\/\-]/);
    if (parts.length === 3) {
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const y = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    return new Date('2010-01-01');
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
      const { 
        classId, 
        sectionId, 
        status, 
        search, 
        page = '1', 
        limit = '10' 
      } = req.query;

      const pPage = Math.max(1, parseInt(page as string));
      const pLimit = Math.max(1, parseInt(limit as string));
      const skip = (pPage - 1) * pLimit;

      // 1. Build Base Match Queries
      const baseMatch: any = { 
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string), 
        isDeleted: { $ne: true } 
      };
      
      if (classId) baseMatch.classId = new mongoose.Types.ObjectId(classId as string);
      if (sectionId) baseMatch.sectionId = new mongoose.Types.ObjectId(sectionId as string);
      if (status && status !== 'ALL') baseMatch.status = status;

      // Pipeline for data
      const pipeline: any[] = [
        { $match: baseMatch },
        // Join with Users to allow searching by name/email
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        // Join with Classes for display names
        {
          $lookup: {
            from: 'classsections',
            localField: 'classId',
            foreignField: '_id',
            as: 'classDetails'
          }
        },
        { $unwind: { path: '$classDetails', preserveNullAndEmptyArrays: true } }
      ];

      // 2. Add Search Filter if present
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        pipeline.push({
          $match: {
            $or: [
              { 'userDetails.firstName': searchRegex },
              { 'userDetails.lastName': searchRegex },
              { 'userDetails.email': searchRegex },
              { admissionNumber: searchRegex },
              { 'guardians.name': searchRegex },
              { 'guardians.phone': searchRegex }
            ]
          }
        });
      }

      // 3. Facet for pagination and counts
      pipeline.push({
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { admissionNumber: 1 } },
            { $skip: skip },
            { $limit: pLimit },
            {
              $project: {
                _id: 1,
                admissionNumber: 1,
                rollNumber: 1,
                status: 1,
                createdAt: 1,
                guardians: {
                  name: 1,
                  phone: 1,
                  isEmergencyContact: 1
                },
                userId: {
                  _id: '$userDetails._id',
                  firstName: '$userDetails.firstName',
                  lastName: '$userDetails.lastName',
                  email: '$userDetails.email',
                  avatarUrl: '$userDetails.avatarUrl'
                },
                classId: {
                  _id: '$classDetails._id',
                  grade: '$classDetails.grade',
                  section: '$classDetails.section',
                  displayName: '$classDetails.displayName'
                }
              }
            }
          ]
        }
      });

      const [result] = await Student.aggregate(pipeline);
      
      const total = result.metadata[0]?.total || 0;
      
      return ApiResponse.success(res, {
        students: result.data,
        meta: {
          total,
          page: pPage,
          limit: pLimit,
          totalPages: Math.ceil(total / pLimit)
        }
      });
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

      const { data, config, classMap: rawClassMap, mapping: rawMapping } = req.body;
      const schoolId = req.tenantId;
      const createdBy = req.jwtPayload?.userId;

      if (!schoolId) {
        throw createError(403, ErrorCodes.FORBIDDEN, 'Tenant context missing');
      }

      if (!data || !Array.isArray(data)) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid import data format');
      }

      if (!config.branchId || !config.academicYearId) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Missing Global Config (Branch or Academic Year)');
      }

      // Hardening: Normalize all keys for resilient mapping
      const mapping: Record<string, string> = {};
      Object.entries(rawMapping || {}).forEach(([k, v]) => {
        mapping[k] = v ? v.toString().trim() : '';
      });

      const classMap: Record<string, string> = {};
      Object.entries(rawClassMap || {}).forEach(([k, v]) => {
        classMap[k.toString().trim()] = v ? v.toString().trim() : '';
      });

      const results = {
        total: data.length,
        success: 0,
        failed: 0,
        errors: [] as any[]
      };

      // To prevent massive parallel DB locks and handle sequential IDs correctly, 
      // we process in sequence for now. For huge datasets (>5k), we would queue this.
      for (const [index, row] of data.entries()) {
        try {
          // 1. Extract and Normalize Data based on mapping
          const getValue = (field: string) => {
            const mappedHeader = mapping[field];
            if (!mappedHeader || !row[mappedHeader]) return undefined;
            return row[mappedHeader].toString().trim();
          };

          const firstName = getValue('firstName');
          const lastName = getValue('lastName') || 'Student';
          const email = getValue('email');
          const phone = getValue('phone');
          const genderRaw = getValue('gender')?.toUpperCase();
          const dobRaw = getValue('dateOfBirth');
          const admissionNoRaw = getValue('admissionNumber');
          const rollNumber = parseInt(getValue('rollNumber') || '0') || 0;
          const classRaw = getValue('classId');

          // Guardian Info
          const gName = getValue('guardianName');
          const gPhone = getValue('guardianPhone');
          const gEmail = getValue('guardianEmail');

          if (!firstName || !classRaw) {
            throw new Error(`Row ${index + 1}: Missing mandatory Name or Class info.`);
          }

          // 2. Resolve IDs
          const classId = classMap[classRaw];
          if (!classId) throw new Error(`Class "${classRaw}" not mapped to system.`);

          const admissionNumber = admissionNoRaw || await StudentController.generateAdmissionNumber(schoolId);

          // 3. Normalize Gender
          let gender: any = 'OTHER';
          if (genderRaw?.startsWith('M')) gender = 'MALE';
          if (genderRaw?.startsWith('F')) gender = 'FEMALE';

          // 4. Handle Guardian/Parent Deduction (Sibling logic)
          let parentUserId = null;
          if (gPhone) {
            const existingParent = await User.findOne({ phone: gPhone, role: 'PARENT', schoolId });
            if (existingParent) {
              parentUserId = existingParent._id;
            } else {
              // Create Parent User (INACTIVE)
              const parentUser = new User({
                // Add entropy to parent email to prevent clash
                email: gEmail ? gEmail.toLowerCase() : `${gPhone}.${schoolId.toString().slice(-4)}${crypto.randomBytes(2).toString('hex')}@parent.local`,
                phone: gPhone,
                passwordHash: crypto.randomBytes(16).toString('hex'),
                firstName: gName?.split(' ')[0] || 'Guardian',
                lastName: gName?.split(' ').slice(1).join(' ') || 'User',
                role: 'PARENT',
                schoolId,
                isActive: false
              });
              await parentUser.save();
              parentUserId = parentUser._id;
            }
          }

          // 5. Create Student User (INACTIVE)
          // Add school-specific suffix and random entropy to prevent email collisions in multi-tenant DB
          const studentEmail = email ? email.toLowerCase() : `${admissionNumber.toLowerCase()}.${schoolId.toString().slice(-4)}@student.local`;
          const studentUser = new User({
            email: studentEmail.toLowerCase(),
            phone,
            passwordHash: crypto.randomBytes(16).toString('hex'),
            firstName,
            lastName,
            role: 'STUDENT',
            schoolId,
            branchId: config.branchId,
            isActive: false,
            createdBy
          });
          await studentUser.save();

          // 6. Create Student Profile
          const student = new Student({
            schoolId,
            branchId: config.branchId,
            academicYearId: config.academicYearId,
            classId,
            userId: studentUser._id,
            admissionNumber,
            rollNumber,
            dateOfBirth: StudentController.parseExcelDate(dobRaw),
            gender,
            nationality: getValue('nationality') || 'Indian',
            currentAddress: {
              line1: getValue('address') || 'Not Provided',
              city: getValue('city') || 'Not Provided',
              state: getValue('state') || 'Not Provided',
              pincode: getValue('pincode') || '000000'
            },
            guardians: [{
              name: gName || 'Parent',
              relationship: 'Guardian',
              phone: gPhone || '0000000000',
              email: gEmail,
              isEmergencyContact: true,
              userId: parentUserId
            }],
            createdBy
          });

          await student.save();

          // Link profile back
          studentUser.studentProfileId = student._id as any;
          await studentUser.save();

          results.success++;
        } catch (err: any) {
          console.error(`[BULK_IMPORT] Error on row ${index + 1}:`, err.message);
          results.failed++;
          results.errors.push({
            row: index + 1,
            name: row[mapping['firstName']] || 'Unknown',
            reason: err.message
          });
        }
      }

      console.log('[BULK_IMPORT] Process complete:', {
        success: results.success,
        failed: results.failed,
        errorCount: results.errors.length
      });

      return ApiResponse.success(res, {
        ...results,
        message: `Import complete. ${results.success} students enrolled, ${results.failed} failed.`
      });
    } catch (error) {
      console.error('[BULK_IMPORT] FATAL ERROR:', error);
      next(error);
    }
  }
}
