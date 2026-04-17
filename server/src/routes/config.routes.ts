import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { AcademicYearController } from '../controllers/academicYear.controller';
import { ClassSectionController } from '../controllers/classSection.controller';
import { tenantContextMiddleware } from '../middleware/tenantContext.middleware';
// Note: authMiddleware should be ideally applied globally or here. 
// For now, assuming it will be added to the server or here later.

const router = Router();

// Apply tenant context to all configuration routes
router.use(tenantContextMiddleware);

// Branch Routes
router.post('/branches', BranchController.create);
router.get('/branches', BranchController.list);
router.put('/branches/:id', BranchController.update);
router.delete('/branches/:id', BranchController.delete);

// Academic Year Routes
router.post('/academic-years', AcademicYearController.create);
router.get('/academic-years', AcademicYearController.list);
router.put('/academic-years/:id', AcademicYearController.update);
router.delete('/academic-years/:id', AcademicYearController.delete);

// Class Section Routes
router.post('/classes', ClassSectionController.create);
router.get('/classes', ClassSectionController.list);
router.put('/classes/:id', ClassSectionController.update);
router.delete('/classes/:id', ClassSectionController.delete);

export default router;
