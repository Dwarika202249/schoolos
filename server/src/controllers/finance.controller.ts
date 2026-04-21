import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { FeeCategory } from "../models/FeeCategory.model";
import { FeeStructure } from "../models/FeeStructure.model";
import { Invoice, InvoiceStatus } from "../models/Invoice.model";
import { Transaction } from "../models/Transaction.model";
import { SalaryConfig } from "../models/SalaryConfig.model";
import { Payroll, PayrollStatus } from "../models/Payroll.model";
import { Student } from "../models/Student.model";
import { ApiResponse } from "../utils/response.util";
import { createError, ErrorCodes } from "../utils/error.util";
import { withTenantScope } from "../utils/tenantQuery.util";

export class FinanceController {
  // ─── Fee Categories ─────────────────────────────────────────────────────────

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = new FeeCategory({
        ...req.body,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });
      await category.save();
      return ApiResponse.created(res, category);
    } catch (error) {
      next(error);
    }
  }

  static async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      const categories = await FeeCategory.find(query);
      return ApiResponse.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      const category = await FeeCategory.findOneAndUpdate(
        { _id: id, schoolId },
        { ...req.body, updatedBy: req.jwtPayload?.userId },
        { new: true, runValidators: true }
      );

      if (!category) {
        throw createError(404, ErrorCodes.NOT_FOUND, "Fee category not found");
      }

      return ApiResponse.success(res, category, "Fee category updated");
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      // Check if any structures exist for this category
      const linkCount = await FeeStructure.countDocuments({ categoryId: id, schoolId });
      if (linkCount > 0) {
        throw createError(400, ErrorCodes.VALIDATION_ERROR, "Cannot delete category linked to active fee structures");
      }

      await FeeCategory.findOneAndDelete({ _id: id, schoolId });
      return ApiResponse.success(res, null, "Fee category deleted");
    } catch (error) {
      next(error);
    }
  }

  // ─── Fee Structure ──────────────────────────────────────────────────────────

  static async createStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = new FeeStructure({
        ...req.body,
        schoolId: req.tenantId,
        createdBy: req.jwtPayload?.userId,
      });
      await structure.save();
      return ApiResponse.created(res, structure);
    } catch (error) {
      next(error);
    }
  }

  static async listStructures(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      const structures = await FeeStructure.find(query)
        .populate("categoryId", "name")
        .populate("classId", "displayName");
      return ApiResponse.success(res, structures);
    } catch (error) {
      next(error);
    }
  }

  // ─── Invoicing Logic ─────────────────────────────────────────────────────────

  /**
   * generateClassInvoices
   * Triggers monthly billing for an entire class based on active structures.
   */
  static async generateClassInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, academicYearId, month, year } = req.body;
      const schoolId = req.tenantId;

      const structures = await FeeStructure.find({
        schoolId,
        classId,
        academicYearId,
        frequency: "MONTHLY",
        isDeleted: false,
      }).populate("categoryId");

      if (structures.length === 0) {
        throw createError(400, ErrorCodes.VALIDATION_ERROR, "No monthly fee structure defined for this class");
      }

      const students = await Student.find({
        schoolId,
        classId,
        academicYearId,
        status: "ACTIVE",
        isDeleted: false,
      });

      let createdCount = 0;
      for (const student of students) {
        const exists = await Invoice.findOne({
          studentId: student._id,
          month,
          academicYearId,
          isDeleted: false,
        });

        if (exists) continue;

        const items = structures.map((s: any) => ({
          categoryId: s.categoryId._id,
          name: s.categoryId.name,
          amount: s.amount,
        }));

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        const invoice = new Invoice({
          schoolId,
          branchId: student.branchId,
          studentId: student._id,
          academicYearId,
          invoiceNumber: `INV-${year}${month}-${Math.floor(Math.random() * 9000) + 1000}`,
          items,
          totalAmount,
          dueAmount: totalAmount,
          paidAmount: 0,
          status: InvoiceStatus.UNPAID,
          month,
          issuedDate: new Date(),
          dueDate: new Date(year, month - 1, 10),
          createdBy: req.jwtPayload?.userId,
        });

        await invoice.save();
        createdCount++;
      }

      return ApiResponse.success(res, { createdCount }, `Generated ${createdCount} invoices`);
    } catch (error) {
      next(error);
    }
  }

  static async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, status, studentId } = req.query;
      const query: any = withTenantScope(req);
      
      if (status) query.status = status;
      if (studentId) query.studentId = studentId;
      
      const invoices = await Invoice.find(query)
        .populate("studentId", "admissionNumber")
        .populate({
          path: 'studentId',
          populate: { path: 'userId', select: 'firstName lastName' }
        })
        .sort({ issuedDate: -1 });

      return ApiResponse.success(res, invoices);
    } catch (error) {
      next(error);
    }
  }

  // ─── Fee Collection ──────────────────────────────────────────────────────────

  static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId, amount, paymentMethod, referenceId, notes } = req.body;
      const schoolId = req.tenantId;

      const invoice = await Invoice.findOne({ _id: invoiceId, schoolId });
      if (!invoice) {
        throw createError(404, ErrorCodes.NOT_FOUND, "Invoice not found");
      }

      const transaction = new Transaction({
        schoolId,
        branchId: invoice.branchId,
        invoiceId: invoice._id,
        studentId: invoice.studentId,
        type: "INCOME",
        category: "FEE_COLLECTION",
        amount,
        paymentMethod,
        referenceId,
        notes,
        createdBy: req.jwtPayload?.userId,
      });
      await transaction.save();

      invoice.paidAmount += amount;
      invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;

      if (invoice.dueAmount <= 0) {
        invoice.status = InvoiceStatus.PAID;
      } else {
        invoice.status = InvoiceStatus.PARTIAL;
      }

      await invoice.save();
      return ApiResponse.success(res, { invoice, transaction }, "Payment recorded successfully");
    } catch (error) {
      next(error);
    }
  }

  // ─── Transactions ──────────────────────────────────────────────────────────

  static async listTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = withTenantScope(req);
      const transactions = await Transaction.find(query)
        .sort({ transactionDate: -1 })
        .limit(50);
      return ApiResponse.success(res, transactions);
    } catch (error) {
      next(error);
    }
  }

  // ─── Payroll Management ──────────────────────────────────────────────────────

  static async updateSalaryConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { staffId } = req.params;
      const schoolId = req.tenantId;

      const config = await SalaryConfig.findOneAndUpdate(
        { staffId, schoolId },
        { ...req.body, schoolId, updatedBy: req.jwtPayload?.userId },
        { upsert: true, new: true, runValidators: true },
      );

      return ApiResponse.success(res, config, "Salary configuration updated");
    } catch (error) {
      next(error);
    }
  }

  static async getSalaryConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { staffId } = req.params;
      const config = await SalaryConfig.findOne({ staffId, schoolId: req.tenantId });
      return ApiResponse.success(res, config);
    } catch (error) {
      next(error);
    }
  }

  static async processPayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, branchId } = req.body;
      const schoolId = req.tenantId;

      const configs = await SalaryConfig.find({ schoolId }).populate("staffId");
      let count = 0;

      for (const config of configs) {
        const exists = await Payroll.findOne({
          staffId: config.staffId._id,
          month,
          year,
          schoolId,
        });

        if (exists) continue;

        const payroll = new Payroll({
          schoolId,
          branchId: branchId || (config.staffId as any).branchId,
          staffId: config.staffId._id,
          month,
          year,
          basicSalary: config.basicSalary,
          totalAllowances: config.allowances.reduce((s, a) => s + a.amount, 0),
          totalDuctions: config.deductions.reduce((s, d) => s + d.amount, 0),
          netSalary: config.netSalary,
          status: PayrollStatus.DRAFT,
          createdBy: req.jwtPayload?.userId,
        });

        await payroll.save();
        count++;
      }

      return ApiResponse.success(res, { count }, `Processed ${count} payroll records`);
    } catch (error) {
      next(error);
    }
  }

  static async getPayrolls(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const query: any = withTenantScope(req);
      if (month) query.month = parseInt(month as string);
      if (year) query.year = parseInt(year as string);

      const payrolls = await Payroll.find(query).populate({
        path: 'staffId',
        populate: { path: 'userId', select: 'firstName lastName' }
      });
      return ApiResponse.success(res, payrolls);
    } catch (error) {
      next(error);
    }
  }

  static async payoutPayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const { payrollId, paymentMethod, referenceId } = req.body;
      const schoolId = req.tenantId;

      const payroll = await Payroll.findOne({ _id: payrollId, schoolId, status: PayrollStatus.PROCESSED || PayrollStatus.DRAFT });
      if (!payroll) {
        throw createError(404, ErrorCodes.NOT_FOUND, "Payroll record not found or already paid");
      }

      // Create Expense Transaction
      const transaction = new Transaction({
        schoolId,
        branchId: payroll.branchId,
        staffId: payroll.staffId,
        type: "EXPENSE",
        category: "SALARY_PAYOUT",
        amount: payroll.netSalary,
        paymentMethod,
        referenceId,
        notes: `Salary payout for ${payroll.month}/${payroll.year}`,
        createdBy: req.jwtPayload?.userId,
      });
      await transaction.save();

      payroll.status = PayrollStatus.PAID;
      payroll.paymentDate = new Date();
      payroll.transactionId = transaction._id as any;
      await payroll.save();

      return ApiResponse.success(res, { payroll, transaction }, "Salary payout recorded");
    } catch (error) {
      next(error);
    }
  }

  // ─── Finance Overview ────────────────────────────────────────────────────────

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Cast to ObjectId — aggregation $match does NOT auto-cast strings
      const schoolId = new mongoose.Types.ObjectId(req.tenantId as string);

      const [income, outstanding, payroll] = await Promise.all([
        Transaction.aggregate([
          { $match: { schoolId, type: "INCOME" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Invoice.aggregate([
          { $match: { schoolId, isDeleted: false, status: { $ne: InvoiceStatus.PAID } } },
          { $group: { _id: null, total: { $sum: "$dueAmount" } } },
        ]),
        Payroll.aggregate([
          { $match: { schoolId, status: PayrollStatus.PAID } },
          { $group: { _id: null, total: { $sum: "$netSalary" } } },
        ]),
      ]);

      return ApiResponse.success(res, {
        totalIncome: income[0]?.total || 0,
        totalOutstanding: outstanding[0]?.total || 0,
        totalPayrollExpenses: payroll[0]?.total || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Fee Defaulters List ─────────────────────────────────────────────────────

  /**
   * GET /tenant/finance/defaulters
   * Returns students with outstanding (UNPAID/PARTIAL) invoices.
   * Aggregates total due per student + overdue days from the oldest invoice.
   * Query params: classId (optional filter), limit (default 100)
   */
  static async getDefaulters(req: Request, res: Response, next: NextFunction) {
    try {
      // Cast to ObjectId — aggregation $match does NOT auto-cast strings
      const schoolId = new mongoose.Types.ObjectId(req.tenantId as string);
      const { classId, limit = 100 } = req.query;
      const today = new Date();

      // Build match query
      const matchQuery: any = {
        schoolId,
        isDeleted: false,
        status: { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] }
      };

      // Aggregate invoices grouped by student
      const defaulters = await Invoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$studentId',
            totalDue: { $sum: '$dueAmount' },
            invoiceCount: { $sum: 1 },
            oldestDueDate: { $min: '$dueDate' },
            latestInvoiceDate: { $max: '$issuedDate' },
            invoiceIds: { $push: '$_id' }
          }
        },
        {
          $addFields: {
            overdueDays: {
              $max: [
                0,
                { $divide: [{ $subtract: [today, '$oldestDueDate'] }, 1000 * 60 * 60 * 24] }
              ]
            }
          }
        },
        { $sort: { totalDue: -1 } },
        { $limit: parseInt(limit as string) },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'users',
            localField: 'student.userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'classsections',
            localField: 'student.classId',
            foreignField: '_id',
            as: 'class'
          }
        },
        { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            totalDue: 1,
            invoiceCount: 1,
            overdueDays: { $round: ['$overdueDays', 0] },
            oldestDueDate: 1,
            student: {
              _id: '$student._id',
              admissionNumber: '$student.admissionNumber',
              classId: '$student.classId'
            },
            user: {
              firstName: '$user.firstName',
              lastName: '$user.lastName',
            },
            class: {
              displayName: '$class.displayName',
              grade: '$class.grade',
              section: '$class.section'
            }
          }
        }
      ]);

      // Optional class filter (post-aggregate since classId is on Student not Invoice)
      const filtered = classId
        ? defaulters.filter(d => d.student?.classId?.toString() === classId)
        : defaulters;

      return ApiResponse.success(res, filtered);
    } catch (error) {
      next(error);
    }
  }

  // ─── Individual Invoice Generation ────────────────────────────────────────────

  /**
   * POST /tenant/finance/invoices/generate-student
   * Generates a one-off invoice for a specific student.
   * Body: { studentId, academicYearId, categoryId, amount, dueDate, description }
   */
  static async generateStudentInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, academicYearId, categoryId, amount, dueDate, description } = req.body;
      const schoolId = req.tenantId;

      if (!studentId || !academicYearId || !amount || !dueDate) {
        throw createError(400, ErrorCodes.BAD_REQUEST, 'studentId, academicYearId, amount, and dueDate are required');
      }

      const student = await Student.findOne({ _id: studentId, schoolId }).select('branchId');
      if (!student) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Student not found');
      }

      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;

      const items = [{
        categoryId: categoryId || null,
        name: description || 'Fee',
        amount: Math.round(amount) // should be in paise
      }];

      const invoice = new Invoice({
        schoolId,
        branchId: student.branchId,
        studentId,
        academicYearId,
        invoiceNumber,
        items,
        totalAmount: Math.round(amount),
        dueAmount: Math.round(amount),
        paidAmount: 0,
        status: InvoiceStatus.UNPAID,
        issuedDate: now,
        dueDate: new Date(dueDate),
        createdBy: req.jwtPayload?.userId,
      });

      await invoice.save();

      // Populate for response
      const populated = await Invoice.findById(invoice._id)
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName' } });

      return ApiResponse.created(res, populated, 'Invoice generated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ─── Invoice Receipt ───────────────────────────────────────────────────────────

  /**
   * GET /tenant/finance/invoices/:id/receipt
   * Returns full invoice + related transactions for receipt generation.
   */
  static async getInvoiceReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schoolId = req.tenantId;

      const [invoice, transactions] = await Promise.all([
        Invoice.findOne({ _id: id, schoolId })
          .populate({
            path: 'studentId',
            select: 'admissionNumber classId',
            populate: [
              { path: 'userId', select: 'firstName lastName' },
              { path: 'classId', select: 'displayName grade section' }
            ]
          }),
        Transaction.find({ invoiceId: id, schoolId }).sort({ createdAt: -1 })
      ]);

      if (!invoice) {
        throw createError(404, ErrorCodes.NOT_FOUND, 'Invoice not found');
      }

      return ApiResponse.success(res, { invoice, transactions });
    } catch (error) {
      next(error);
    }
  }
}
