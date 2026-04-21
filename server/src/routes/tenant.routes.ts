import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { AcademicYearController } from '../controllers/academicYear.controller';
import { ClassSectionController } from '../controllers/classSection.controller';
import { TenantController } from '../controllers/tenant.controller';
import { FinanceController } from '../controllers/finance.controller';
import { StaffController } from '../controllers/staff.controller';
import { SubjectController } from '../controllers/subject.controller';
import { AttendanceController } from '../controllers/attendance.controller';
import { ExamController } from '../controllers/exam.controller';
import { TimetableController } from '../controllers/timetable.controller';
import { requireOwner, requireAdmin, requireAnyStaff } from '../middleware/rbac.middleware';

const router = Router();

// ─── Branch Routes ────────────────────────────────────────────────────────────
// Docs: POST/PATCH/DELETE = OWNER, GET = OWNER/ADMIN
router.post('/branches', requireOwner, BranchController.create);
router.get('/branches', requireAdmin, BranchController.list);
router.patch('/branches/:id', requireOwner, BranchController.update);
router.delete('/branches/:id', requireOwner, BranchController.delete);

// ─── Academic Year Routes ─────────────────────────────────────────────────────
// Docs: POST/PATCH = OWNER, GET = OWNER/ADMIN
router.post('/academic-years', requireOwner, AcademicYearController.create);
router.get('/academic-years', requireAdmin, AcademicYearController.list);
router.patch('/academic-years/:id', requireOwner, AcademicYearController.update);
router.delete('/academic-years/:id', requireOwner, AcademicYearController.delete);

// ─── Class Section Routes ─────────────────────────────────────────────────────
// Docs: POST/DELETE = OWNER/ADMIN, GET = ALL_STAFF
router.post('/classes', requireAdmin, ClassSectionController.create);
router.get('/classes', requireAnyStaff, ClassSectionController.list);
router.patch('/classes/:id', requireAdmin, ClassSectionController.update);
router.delete('/classes/:id', requireOwner, ClassSectionController.delete);

// ─── Subject Routes ───────────────────────────────────────────────────────────
router.post('/subjects', requireAdmin, SubjectController.create);
router.get('/subjects', requireAnyStaff, SubjectController.list);
router.patch('/subjects/:id', requireAdmin, SubjectController.update);
router.delete('/subjects/:id', requireOwner, SubjectController.delete);

// ─── School Settings Routes ───────────────────────────────────────────────────
// Docs: PATCH = OWNER only, GET = ADMIN/OWNER
router.get('/school', requireAdmin, TenantController.getSchool);
router.patch('/school', requireOwner, TenantController.updateSchool);

// ─── Dashboard Stats Route ────────────────────────────────────────────────────
router.get('/dashboard/stats', requireAnyStaff, TenantController.getDashboardStats);

// ─── Staff Routes ─────────────────────────────────────────────────────────────
router.post('/staff', requireAdmin, StaffController.createStaff);
router.get('/staff', requireAdmin, StaffController.getStaffList);
router.get('/staff/:id', requireAdmin, StaffController.getStaffDetails);
router.patch('/staff/:id', requireAdmin, StaffController.updateStaff);

// Staff Attendance
router.get('/staff-attendance/sheet', requireAdmin, StaffController.getAttendanceSheet);
router.post('/staff-attendance/mark', requireAdmin, StaffController.markAttendance);

// ─── Finance Roles ────────────────────────────────────────────────────────────
// Fee Management
router.post('/finance/categories', requireOwner, FinanceController.createCategory);
router.get('/finance/categories', requireAdmin, FinanceController.listCategories);
router.patch('/finance/categories/:id', requireOwner, FinanceController.updateCategory);
router.delete('/finance/categories/:id', requireOwner, FinanceController.deleteCategory);
router.post('/finance/structures', requireOwner, FinanceController.createStructure);
router.get('/finance/structures', requireAdmin, FinanceController.listStructures);

// Invoicing & Collection
router.get('/finance/invoices', requireAdmin, FinanceController.listInvoices);
router.post('/finance/invoices/generate-class', requireAdmin, FinanceController.generateClassInvoices);
router.post('/finance/invoices/generate-student', requireAdmin, FinanceController.generateStudentInvoice);
router.get('/finance/invoices/:id/receipt', requireAdmin, FinanceController.getInvoiceReceipt);
router.post('/finance/collect', requireAdmin, FinanceController.recordPayment);
router.get('/finance/transactions', requireAdmin, FinanceController.listTransactions);
router.get('/finance/stats', requireAdmin, FinanceController.getStats);
router.get('/finance/defaulters', requireAdmin, FinanceController.getDefaulters);

// Payroll
router.get('/finance/payroll/config/:staffId', requireAdmin, FinanceController.getSalaryConfig);
router.patch('/finance/payroll/config/:staffId', requireOwner, FinanceController.updateSalaryConfig);
router.post('/finance/payroll/process', requireOwner, FinanceController.processPayroll);
router.get('/finance/payroll', requireAdmin, FinanceController.getPayrolls);
router.post('/finance/payroll/payout', requireOwner, FinanceController.payoutPayroll);

// ─── Attendance Routes ────────────────────────────────────────────────────────
router.get('/attendance/sheet', requireAnyStaff, AttendanceController.getAttendanceSheet);
router.post('/attendance/mark', requireAnyStaff, AttendanceController.markAttendance);
router.get('/attendance/stats', requireAnyStaff, AttendanceController.getStudentStats);

// ─── Exam & Grade Routes ───────────────────────────────────────────────────────
router.get('/exams/terms', requireAnyStaff, ExamController.listTerms);
router.post('/exams/terms', requireAdmin, ExamController.createTerm);
router.put('/exams/terms/:id', requireAdmin, ExamController.updateTerm);
router.delete('/exams/terms/:id', requireAdmin, ExamController.deleteTerm);

router.get('/exams/schedules', requireAnyStaff, ExamController.listSchedules);
router.post('/exams/schedules', requireAdmin, ExamController.createSchedule);
router.put('/exams/schedules/:id', requireAdmin, ExamController.updateSchedule);
router.delete('/exams/schedules/:id', requireAdmin, ExamController.deleteSchedule);

router.get('/exams/marking-sheet/:scheduleId', requireAnyStaff, ExamController.getMarkingSheet);
router.post('/exams/bulk-update-marks', requireAnyStaff, ExamController.bulkUpdateMarks);

// --- Timetable & Substitution Routes ---
router.get('/timetable/class/:classId', requireAnyStaff, TimetableController.getClassSchedule);
router.get('/timetable/teacher/:userId', requireAnyStaff, TimetableController.getTeacherMasterSchedule);
router.post('/timetable/upsert', requireAdmin, TimetableController.upsertTimetableSlot);
router.get('/timetable/my-schedule', requireAnyStaff, TimetableController.getMyScheduleToday);

router.get('/substitution/ledger', requireAdmin, TimetableController.getDailyLedger);
router.get('/substitution/available-teachers', requireAdmin, TimetableController.getAvailableTeachers);
router.post('/substitution/assign', requireAdmin, TimetableController.assignSubstitution);

router.get('/exams/student-report/:studentId', requireAnyStaff, ExamController.getStudentReport);

router.post('/exams/grade-system/seed', requireAdmin, ExamController.seedDefaultGrades);
router.get('/exams/grade-system', requireAdmin, ExamController.getGradeSystem);
router.post('/exams/grade-system', requireAdmin, ExamController.createGrade);
router.patch('/exams/grade-system/:id', requireAdmin, ExamController.updateGrade);
router.delete('/exams/grade-system/:id', requireAdmin, ExamController.deleteGrade);

export default router;
