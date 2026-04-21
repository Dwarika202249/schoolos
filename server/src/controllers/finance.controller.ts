import { Request, Response, NextFunction } from "express";
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
      const schoolId = req.tenantId;

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
}
