import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/Attendance.model';
import { Student } from '../models/Student.model';
import { AcademicYear } from '../models/AcademicYear.model';
import { Timetable } from '../models/Timetable.model';
import { ClassSection } from '../models/ClassSection.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import mongoose from 'mongoose';

export class AttendanceController {
  
  /**
   * GET /tenant/attendance/sheet?classId=...&date=...
   * Fetches students for a class and any existing attendance records for the date.
   */
  static async getAttendanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, date } = req.query;
      const schoolId = req.tenantId;

      if (!classId || !date) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Class ID and Date are required');
      }

      if (!mongoose.Types.ObjectId.isValid(classId as string)) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid Class ID format');
      }

      // ── Security Scoping for Teachers ────────────────────────────────
      if (req.jwtPayload?.role === 'TEACHER') {
          const teacherId = new mongoose.Types.ObjectId(req.jwtPayload.userId as string);
          const cid = new mongoose.Types.ObjectId(classId as string);

          const isClassTeacher = await ClassSection.exists({ _id: cid, classTeacherId: teacherId });
          const isSubjectTeacher = await Timetable.exists({ classId: cid, teacherId });

          if (!isClassTeacher && !isSubjectTeacher) {
              throw createError(403, ErrorCodes.FORBIDDEN, 'You are not authorized to view this attendance sheet.');
          }
      }
      // ──────────────────────────────────────────────────────────────────

      const queryDate = new Date(date as string);
      queryDate.setUTCHours(0, 0, 0, 0);

      // 1. Get all students in the class
      const students = await Student.find({
        schoolId,
        classId: new mongoose.Types.ObjectId(classId as string),
        status: 'ACTIVE',
        isDeleted: { $ne: true }
      })
      .populate('userId', 'firstName lastName email avatarUrl')
      .sort({ admissionNumber: 1 });

      // 2. Get existing attendance record if any
      const existing = await Attendance.findOne({
        schoolId,
        classId: new mongoose.Types.ObjectId(classId as string),
        date: queryDate
      });

      return ApiResponse.success(res, {
        students,
        existingRecords: existing ? existing.records : [],
        summary: existing ? existing.summary : null,
        attendanceId: existing ? existing._id : null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tenant/attendance/mark
   * Payload: { classId, date, academicYearId, records: [{ studentId, status, comment }] }
   */
  static async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, date, academicYearId, records } = req.body;
      const schoolId = req.tenantId;
      const markedBy = req.jwtPayload?.userId;

      if (!classId || !date || !academicYearId || !records) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Missing required fields');
      }

      // Check if Academic Year is locked
      const ay = await AcademicYear.findById(academicYearId);
      if (ay?.isLocked) {
        throw createError(403, ErrorCodes.FORBIDDEN, 'Attendance cannot be marked for a locked Academic Year');
      }

      // ── Security Scoping for Teachers ────────────────────────────────
      if (req.jwtPayload?.role === 'TEACHER') {
          const teacherId = new mongoose.Types.ObjectId(req.jwtPayload.userId as string);
          const cid = new mongoose.Types.ObjectId(classId as string);

          const isClassTeacher = await ClassSection.exists({ _id: cid, classTeacherId: teacherId });
          const isSubjectTeacher = await Timetable.exists({ classId: cid, teacherId });

          if (!isClassTeacher && !isSubjectTeacher) {
              throw createError(403, ErrorCodes.FORBIDDEN, 'You are not authorized to mark attendance for this class.');
          }
      }
      // ──────────────────────────────────────────────────────────────────

      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0);

      const summary = {
        present: records.filter((r: any) => r.status === 'PRESENT').length,
        absent: records.filter((r: any) => r.status === 'ABSENT').length,
        late: records.filter((r: any) => r.status === 'LATE').length
      };

      const result = await Attendance.findOneAndUpdate(
        { 
          schoolId: new mongoose.Types.ObjectId(schoolId as string), 
          classId: new mongoose.Types.ObjectId(classId as string), 
          date: queryDate 
        },
        {
          $set: {
            academicYearId: new mongoose.Types.ObjectId(academicYearId as string),
            markedBy: new mongoose.Types.ObjectId(markedBy as string),
            records,
            summary,
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      return ApiResponse.success(res, result, 'Attendance marked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tenant/attendance/stats?studentId=...
   * Fetches attendance analytics for a specific student.
   */
  static async getStudentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.query;
      const schoolId = req.tenantId;

      if (!studentId) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Student ID is required');
      }

      if (!mongoose.Types.ObjectId.isValid(studentId as string)) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid Student ID format');
      }

      const stats = await Attendance.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId as string), 'records.studentId': new mongoose.Types.ObjectId(studentId as string) } },
        { $unwind: '$records' },
        { $match: { 'records.studentId': new mongoose.Types.ObjectId(studentId as string) } },
        {
          $group: {
            _id: '$records.status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedStats = {
        PRESENT: stats.find(s => s._id === 'PRESENT')?.count || 0,
        ABSENT: stats.find(s => s._id === 'ABSENT')?.count || 0,
        LATE: stats.find(s => s._id === 'LATE')?.count || 0,
        EXCUSED: stats.find(s => s._id === 'EXCUSED')?.count || 0
      };

      return ApiResponse.success(res, formattedStats);
    } catch (error) {
      next(error);
    }
  }
}
