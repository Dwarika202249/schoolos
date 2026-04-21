import { Request, Response, NextFunction } from 'express';
import { ExamTerm } from '../models/ExamTerm.model';
import { ExamSchedule } from '../models/ExamSchedule.model';
import { StudentMark } from '../models/StudentMark.model';
import { Student } from '../models/Student.model';
import { GradeSystem } from '../models/GradeSystem.model';
import { ApiResponse } from '../utils/response.util';
import { createError, ErrorCodes } from '../utils/error.util';
import mongoose from 'mongoose';

export class ExamController {
  
  // ─── Exam Terms ─────────────────────────────────────────────────────────────

  static async createTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, academicYearId, startDate, endDate } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(req.tenantId as string)) throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid school ID');
      if (!mongoose.Types.ObjectId.isValid(req.jwtPayload?.userId as string)) throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid user ID');
      if (!mongoose.Types.ObjectId.isValid(academicYearId)) throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid academic year ID');

      const term = new ExamTerm({
        name,
        academicYearId: new mongoose.Types.ObjectId(academicYearId),
        startDate,
        endDate,
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string),
        createdBy: new mongoose.Types.ObjectId(req.jwtPayload?.userId as string)
      });
      await term.save();
      return ApiResponse.created(res, term, 'Exam term created');
    } catch (error) {
      next(error);
    }
  }

  static async updateTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;
      
      const term = await ExamTerm.findOneAndUpdate(
        { _id: id, schoolId, isDeleted: { $ne: true } },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      if (!term) throw createError(404, ErrorCodes.NOT_FOUND, 'Exam term not found');
      return ApiResponse.success(res, term, 'Exam term updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      // Soft delete term
      const term = await ExamTerm.findOneAndUpdate(
        { _id: id, schoolId },
        { isDeleted: true }
      );

      if (!term) throw createError(404, ErrorCodes.NOT_FOUND, 'Term not found');

      // Cascade soft delete: find schedules for this term
      const schedules = await ExamSchedule.find({ examTermId: id, schoolId });
      const scheduleIds = schedules.map(s => s._id);

      // Delete schedules
      await ExamSchedule.updateMany(
        { examTermId: id, schoolId },
        { isDeleted: true }
      );

      // Delete marks associated with those schedules
      await StudentMark.updateMany(
        { examScheduleId: { $in: scheduleIds }, schoolId },
        { isDeleted: true }
      );

      return ApiResponse.success(res, null, 'Term and associated schedules/marks deleted');
    } catch (error) {
      next(error);
    }
  }

  static async listTerms(req: Request, res: Response, next: NextFunction) {
    try {
      const terms = await ExamTerm.find({ 
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string), 
        isDeleted: { $ne: true } 
      })
      .sort({ startDate: 1 });
      return ApiResponse.success(res, terms);
    } catch (error) {
      next(error);
    }
  }

  // ─── Exam Schedules ─────────────────────────────────────────────────────────

  static async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = new ExamSchedule({
        ...req.body,
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string),
        createdBy: new mongoose.Types.ObjectId(req.jwtPayload?.userId as string)
      });
      await schedule.save();
      return ApiResponse.created(res, schedule, 'Exam scheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      const schedule = await ExamSchedule.findOneAndUpdate(
        { _id: id, schoolId, isDeleted: { $ne: true } },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      if (!schedule) throw createError(404, ErrorCodes.NOT_FOUND, 'Exam schedule not found');
      return ApiResponse.success(res, schedule, 'Exam schedule updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      const schedule = await ExamSchedule.findOneAndUpdate(
        { _id: id, schoolId },
        { isDeleted: true }
      );

      if (!schedule) throw createError(404, ErrorCodes.NOT_FOUND, 'Exam schedule not found');

      // Cascade soft-delete marks
      await StudentMark.updateMany(
        { examScheduleId: id, schoolId },
        { isDeleted: true }
      );

      return ApiResponse.success(res, null, 'Schedule and associated marks deleted');
    } catch (error) {
      next(error);
    }
  }

  static async listSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { examTermId, classId } = req.query;
      const query: any = { 
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string), 
        isDeleted: { $ne: true } 
      };
      
      if (examTermId) query.examTermId = new mongoose.Types.ObjectId(examTermId as string);
      if (classId) query.classId = new mongoose.Types.ObjectId(classId as string);

      const schedules = await ExamSchedule.find(query)
        .populate('subjectId', 'name code')
        .populate('classId', 'displayName')
        .sort({ examDate: 1 });
      
      return ApiResponse.success(res, schedules);
    } catch (error) {
      next(error);
    }
  }

  // ─── Marks Entry ────────────────────────────────────────────────────────────

  /**
   * GET /tenant/exams/marking-sheet/:scheduleId
   * Fetches students for the class and any existing marks for this exam schedule.
   */
  static async getMarkingSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const schoolId = req.tenantId;

      const schedule = await ExamSchedule.findOne({ _id: scheduleId, schoolId });
      if (!schedule) throw createError(404, ErrorCodes.NOT_FOUND, 'Exam schedule not found');

      const [students, existingMarks] = await Promise.all([
        Student.find({ 
          schoolId, 
          classId: schedule.classId, 
          status: 'ACTIVE', 
          isDeleted: { $ne: true } 
        })
        .populate('userId', 'firstName lastName')
        .sort({ admissionNumber: 1 }),
        
        StudentMark.find({ examScheduleId: scheduleId, isDeleted: { $ne: true } })
      ]);

      return ApiResponse.success(res, {
        schedule,
        students,
        existingMarks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tenant/exams/bulk-update-marks
   * Body: { examScheduleId, records: [{ studentId, obtainedMarks, remarks, status }] }
   */
  static async bulkUpdateMarks(req: Request, res: Response, next: NextFunction) {
    try {
      const { examScheduleId, records } = req.body;
      const schoolId = req.tenantId;
      const markedBy = req.jwtPayload?.userId;

      const schedule = await ExamSchedule.findOne({ _id: examScheduleId, schoolId });
      if (!schedule) throw createError(404, ErrorCodes.NOT_FOUND, 'Exam schedule not found');

      // Fetch grade system for this school to auto-calculate grades
      const gradeSystem = await GradeSystem.find({ schoolId, isDeleted: { $ne: true } });

      const bulkOps = records.map((rec: any) => {
        const percentage = Math.round((rec.obtainedMarks / schedule.maxMarks) * 100);
        
        // Find matching grade
        const gradeObj = gradeSystem.find(g => percentage >= g.minPercent && percentage <= g.maxPercent);
        const grade = gradeObj ? gradeObj.label : 'N/A';

        return {
          updateOne: {
            filter: { examScheduleId: new mongoose.Types.ObjectId(examScheduleId as string), studentId: new mongoose.Types.ObjectId(rec.studentId as string) },
            update: {
              $set: {
                schoolId: new mongoose.Types.ObjectId(schoolId as string),
                obtainedMarks: rec.obtainedMarks,
                percentage,
                grade,
                remarks: rec.remarks,
                status: rec.status || 'PRESENT',
                markedBy: new mongoose.Types.ObjectId(markedBy as string),
                updatedAt: new Date()
              }
            },
            upsert: true
          }
        };
      });

      await StudentMark.bulkWrite(bulkOps);

      return ApiResponse.success(res, null, 'Marks updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ─── Grade System ──────────────────────────────────────────────────────────

  /**
   * POST /tenant/exams/grade-system/seed
   * Initializes standard A1-E grading system if none exists.
   */
  static async seedDefaultGrades(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.tenantId;
      const userId = req.jwtPayload?.userId;
      
      console.log('[DEBUG] seed Grades for:', { schoolId, userId });

      if (!mongoose.Types.ObjectId.isValid(schoolId as string)) throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid school ID');
      if (!mongoose.Types.ObjectId.isValid(userId as string)) throw createError(400, ErrorCodes.BAD_REQUEST, 'Invalid user ID');

      const existing = await GradeSystem.findOne({ 
        schoolId: new mongoose.Types.ObjectId(schoolId as string), 
        isDeleted: { $ne: true } 
      });
      
      if (existing) {
        return ApiResponse.success(res, null, 'Grade system already initialized');
      }

      const defaultGrades = [
        { label: 'A1', minPercent: 91, maxPercent: 100, points: 10 },
        { label: 'A2', minPercent: 81, maxPercent: 90, points: 9 },
        { label: 'B1', minPercent: 71, maxPercent: 80, points: 8 },
        { label: 'B2', minPercent: 61, maxPercent: 70, points: 7 },
        { label: 'C1', minPercent: 51, maxPercent: 60, points: 6 },
        { label: 'C2', minPercent: 41, maxPercent: 50, points: 5 },
        { label: 'D',  minPercent: 33, maxPercent: 40, points: 4 },
        { label: 'E',  minPercent: 0,  maxPercent: 32, points: 0 },
      ];

      const docs = defaultGrades.map(g => ({ 
        ...g, 
        isSystem: true,
        schoolId: new mongoose.Types.ObjectId(schoolId as string),
        createdBy: new mongoose.Types.ObjectId(userId as string)
      }));
      
      await GradeSystem.insertMany(docs);

      return ApiResponse.success(res, null, 'Standard grading system initialized');
    } catch (error) {
      next(error);
    }
  }

  static async createGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const grade = new GradeSystem({
        ...req.body,
        isSystem: false,
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string),
        createdBy: new mongoose.Types.ObjectId(req.jwtPayload?.userId as string)
      });
      await grade.save();
      return ApiResponse.created(res, grade, 'Grading scale added');
    } catch (error) {
      next(error);
    }
  }

  static async updateGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      const grade = await GradeSystem.findOneAndUpdate(
        { _id: id, schoolId, isDeleted: { $ne: true } },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      if (!grade) throw createError(404, ErrorCodes.NOT_FOUND, 'Grade scale not found');
      return ApiResponse.success(res, grade, 'Grading scale updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      const grade = await GradeSystem.findOne({ _id: id, schoolId, isDeleted: { $ne: true } });
      if (!grade) throw createError(404, ErrorCodes.NOT_FOUND, 'Grade scale not found');

      if (grade.isSystem) {
        throw createError(403, ErrorCodes.FORBIDDEN, 'System grading scales cannot be deleted');
      }

      grade.isDeleted = true;
      await grade.save();

      return ApiResponse.success(res, null, 'Grading scale deleted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tenant/exams/grade-system
   * Fetches current grading scales for the school.
   */
  static async getGradeSystem(req: Request, res: Response, next: NextFunction) {
    try {
      const grades = await GradeSystem.find({ 
        schoolId: new mongoose.Types.ObjectId(req.tenantId as string), 
        isDeleted: { $ne: true } 
      }).sort({ minPercent: -1 }); // A1 at top
      
      return ApiResponse.success(res, grades);
    } catch (error) {
      next(error);
    }
  }

  // ─── Reporting ─────────────────────────────────────────────────────────────

  /**
   * GET /tenant/exams/student-report/:studentId?examTermId=...
   */
  static async getStudentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { examTermId } = req.query;
      const schoolId = req.tenantId;

      if (!examTermId) throw createError(400, ErrorCodes.BAD_REQUEST, 'examTermId is required');

      // 1. Get all schedules for this term that the class had
      const schedules = await ExamSchedule.find({ 
        examTermId: new mongoose.Types.ObjectId(examTermId as string), 
        schoolId: new mongoose.Types.ObjectId(schoolId as string) 
      })
        .populate('subjectId', 'name code');
      
      const scheduleIds = schedules.map(s => s._id);

      // 2. Get marks for this student for these schedules
      const marks = await StudentMark.find({
        studentId,
        examScheduleId: { $in: scheduleIds },
        isDeleted: { $ne: true }
      });

      // 3. Construct the report object
      const report = schedules.map(s => {
        const m = marks.find(mark => mark.examScheduleId.toString() === s._id.toString());
        return {
          subjectName: (s.subjectId as any).name,
          subjectCode: (s.subjectId as any).code,
          maxMarks: s.maxMarks,
          passingMarks: s.passingMarks,
          obtainedMarks: m ? m.obtainedMarks : null,
          percentage: m ? m.percentage : null,
          grade: m ? m.grade : null,
          status: m ? m.status : 'NOT_ENTERED'
        };
      });

      return ApiResponse.success(res, report);
    } catch (error) {
      next(error);
    }
  }
}
