import { Request, Response, NextFunction } from "express";
import { School } from "../models/School.model";
import { Branch } from "../models/Branch.model";
import { Student } from "../models/Student.model";
import { Attendance } from "../models/Attendance.model";
import { Invoice, InvoiceStatus } from "../models/Invoice.model";
import { Transaction } from "../models/Transaction.model";
import { ClassSection } from "../models/ClassSection.model";
import { ApiResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import mongoose from "mongoose";

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
        configuration,
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
            configuration,
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

  /**
   * GET /tenant/dashboard/stats
   * Returns all KPIs needed by the Dashboard in a single call:
   * - Student count (active)
   * - Today's attendance (classes marked vs total, % present)
   * - Finance stats (income, outstanding)
   * - Recent 5 transactions
   * - Classes that haven't marked attendance today
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = new mongoose.Types.ObjectId(req.tenantId as string);

      // Normalize today to start of day UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const [
        totalStudents,
        activeStudents,
        totalClasses,
        todayAttendance,
        financeStats,
        recentTransactions,
        pendingInvoiceCount,
      ] = await Promise.all([
        // Total student count
        Student.countDocuments({ schoolId, isDeleted: { $ne: true } }),

        // Active students only
        Student.countDocuments({ schoolId, status: 'ACTIVE', isDeleted: { $ne: true } }),

        // Total class sections
        ClassSection.countDocuments({ schoolId, isActive: true, isDeleted: { $ne: true } }),

        // Today's attendance records
        Attendance.find({ schoolId, date: today }).select('classId summary'),

        // Finance overview
        Promise.all([
          Transaction.aggregate([
            { $match: { schoolId, type: 'INCOME' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]),
          Invoice.aggregate([
            { $match: { schoolId, isDeleted: false, status: { $ne: InvoiceStatus.PAID } } },
            { $group: { _id: null, total: { $sum: '$dueAmount' }, count: { $sum: 1 } } }
          ])
        ]),

        // Recent 5 transactions
        Transaction.find({ schoolId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        // Unpaid invoices count
        Invoice.countDocuments({ schoolId, status: { $ne: InvoiceStatus.PAID }, isDeleted: false }),
      ]);

      // Compute today's attendance stats
      const classesMarkedToday = todayAttendance.length;
      const classesNotMarked = totalClasses - classesMarkedToday;
      const totalPresentToday = todayAttendance.reduce((sum, a) => sum + (a.summary?.present || 0), 0);
      const totalAbsentToday = todayAttendance.reduce((sum, a) => sum + (a.summary?.absent || 0), 0);
      const totalLateToday = todayAttendance.reduce((sum, a) => sum + (a.summary?.late || 0), 0);
      const totalMarkedToday = totalPresentToday + totalAbsentToday + totalLateToday;
      const attendancePercent = totalMarkedToday > 0
        ? Math.round((totalPresentToday / totalMarkedToday) * 100)
        : null;

      const [incomeStats, outstandingStats] = financeStats;

      return ApiResponse.success(res, {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: totalStudents - activeStudents,
        },
        attendance: {
          totalClasses,
          classesMarkedToday,
          classesNotMarked,
          presentToday: totalPresentToday,
          absentToday: totalAbsentToday,
          lateToday: totalLateToday,
          attendancePercent,
        },
        finance: {
          totalIncome: incomeStats[0]?.total || 0,
          totalOutstanding: outstandingStats[0]?.total || 0,
          defaulterCount: outstandingStats[0]?.count || 0,
          pendingInvoiceCount,
        },
        recentTransactions,
      });
    } catch (error) {
      next(error);
    }
  }
}
