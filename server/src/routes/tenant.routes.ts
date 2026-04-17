import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { AcademicYearController } from '../controllers/academicYear.controller';
import { ClassSectionController } from '../controllers/classSection.controller';
import { TenantController } from '../controllers/tenant.controller';
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

// ─── School Settings Routes ───────────────────────────────────────────────────
// Docs: PATCH = OWNER only, GET = ADMIN/OWNER
router.get('/school', requireAdmin, TenantController.getSchool);
router.patch('/school', requireOwner, TenantController.updateSchool);

export default router;
