import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Timetable } from '../models/Timetable.model';
import { Substitution } from '../models/Timetable.model'; // Assuming they are in same file as I created them together
import { StaffAttendance } from '../models/StaffAttendance.model';
import { User, UserRole } from '../models/User.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';

export class TimetableController {

  /**
   * GET /tenant/timetable/class/:classId
   */
  static async getClassSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const { academicYearId } = req.query;
      const schoolId = req.tenantId;

      const schedule = await Timetable.find({
        schoolId,
        classId,
        academicYearId,
        isDeleted: { $ne: true }
      })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName avatarUrl')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

      return ApiResponse.success(res, schedule);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tenant/timetable/teacher/:userId
   * Fetches the recurring master schedule for a teacher.
   */
  static async getTeacherMasterSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const schoolId = req.tenantId;

      const schedule = await Timetable.find({
        schoolId,
        teacherId: userId,
        isDeleted: { $ne: true }
      })
      .populate('classId', 'displayName grade section')
      .populate('subjectId', 'name code')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

      return ApiResponse.success(res, schedule);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tenant/timetable/upsert
   */
  static async upsertTimetableSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.tenantId;
      const { academicYearId, classId, dayOfWeek, periodNumber, subjectId, teacherId, startTime, endTime, roomNumber } = req.body;

      // Conflict Check: Is teacher already assigned elsewhere at this time?
      const conflict = await Timetable.findOne({
        schoolId,
        academicYearId,
        teacherId,
        dayOfWeek,
        periodNumber,
        classId: { $ne: classId },
        isDeleted: { $ne: true }
      });

      if (conflict) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'Teacher is already assigned to another class during this period');
      }

      const slot = await Timetable.findOneAndUpdate(
        { schoolId, academicYearId, classId, dayOfWeek, periodNumber },
        { subjectId, teacherId, startTime, endTime, roomNumber, isDeleted: false },
        { upsert: true, new: true }
      );

      return ApiResponse.success(res, slot, 'Timetable slot updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tenant/substitution/ledger?date=...
   * The "Magic" Ledger: Identifies periods where teachers are absent.
   */
  static async getDailyLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const schoolId = req.tenantId;
      
      const queryDate = new Date(date as string);
      queryDate.setUTCHours(0, 0, 0, 0);
      const dayOfWeek = queryDate.getDay() || 7; // Convert 0(Sun) to 7 if needed, or stick to MON=1 style

      // 1. Get all absent staff for today
      const absentStaff = await StaffAttendance.find({
        schoolId,
        date: queryDate,
        status: { $in: ['ABSENT', 'ON_LEAVE'] }
      }).select('userId');

      const absentUserIds = absentStaff.map(s => s.userId);

      // 2. Identify slots in Master Timetable that belong to these absent staff
      const gaps = await Timetable.find({
        schoolId,
        dayOfWeek,
        teacherId: { $in: absentUserIds },
        isDeleted: { $ne: true }
      })
      .populate('classId', 'displayName')
      .populate('subjectId', 'name')
      .populate('teacherId', 'firstName lastName');

      // 3. Get any existing substitutions already made for today
      const existingSubs = await Substitution.find({
        schoolId,
        date: queryDate
      }).populate('substituteTeacherId', 'firstName lastName');

      return ApiResponse.success(res, {
        gaps,
        existingSubstitutions: existingSubs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tenant/substitution/available-teachers?date=...&period=...
   */
  static async getAvailableTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, period } = req.query;
      const schoolId = req.tenantId;
      
      const queryDate = new Date(date as string);
      queryDate.setUTCHours(0, 0, 0, 0);
      const dayOfWeek = queryDate.getDay() || 7;

      // 1. Find all teachers
      const allTeachers = await User.find({
        schoolId,
        role: UserRole.TEACHER,
        isActive: true,
        isDeleted: { $ne: true }
      }).select('firstName lastName avatarUrl');

      // 2. Find teachers who have a class in this period in Master Timetable
      const busyInMaster = await Timetable.find({
        schoolId,
        dayOfWeek,
        periodNumber: Number(period),
        isDeleted: { $ne: true }
      }).select('teacherId');

      const busyInMasterIds = busyInMaster.map(t => t.teacherId.toString());

      // 3. Find teachers who are already doing a substitution in this period
      const busyInSubs = await Substitution.find({
        schoolId,
        date: queryDate,
        periodNumber: Number(period)
      }).select('substituteTeacherId');

      const busyInSubIds = busyInSubs.map(s => s.substituteTeacherId.toString());

      // 4. Find teachers who are absent
      const absentTeachers = await StaffAttendance.find({
        schoolId,
        date: queryDate,
        status: { $in: ['ABSENT', 'ON_LEAVE'] }
      }).select('userId');
      
      const absentIds = absentTeachers.map(a => a.userId.toString());

      // Filter
      const available = allTeachers.filter(t => 
        !busyInMasterIds.includes(t._id.toString()) && 
        !busyInSubIds.includes(t._id.toString()) &&
        !absentIds.includes(t._id.toString())
      );

      return ApiResponse.success(res, available);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tenant/substitution/assign
   */
  static async assignSubstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.tenantId;
      const { date, periodNumber, classId, subjectId, substituteTeacherId, originalTeacherId, note } = req.body;

      const sub = await Substitution.findOneAndUpdate(
        { schoolId, date, periodNumber, classId },
        { subjectId, substituteTeacherId, originalTeacherId, note, isDeleted: false },
        { upsert: true, new: true }
      );

      return ApiResponse.success(res, sub, 'Substitution assigned');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tenant/timetable/today
   * Main endpoint for Teacher Dashboard
   */
  static async getMyScheduleToday(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.jwtPayload?.userId;
      const schoolId = req.tenantId;
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay() || 7;

      // 1. Get regular classes from Master Timetable
      const regular = await Timetable.find({
        schoolId,
        teacherId: userId,
        dayOfWeek,
        isDeleted: { $ne: true }
      })
      .populate('classId', 'displayName')
      .populate('subjectId', 'name code');

      // 2. Get substitutions assigned TO this teacher
      const proxies = await Substitution.find({
        schoolId,
        date,
        substituteTeacherId: userId
      })
      .populate('classId', 'displayName')
      .populate('subjectId', 'name code');

      // 3. (Optional) Remove regular classes if teacher is absent (though they wouldn't see dashboard probably)
      const absentees = await StaffAttendance.findOne({ schoolId, userId, date, status: { $in: ['ABSENT', 'ON_LEAVE'] }});

      return ApiResponse.success(res, {
        isAbsent: !!absentees,
        regularClasses: absentees ? [] : regular,
        substitutions: proxies
      });
    } catch (error) {
      next(error);
    }
  }
}
