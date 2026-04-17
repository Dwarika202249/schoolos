import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { requireAdmin, requireOwner } from '../middleware/rbac.middleware';

const router = Router();

// Docs RBAC: POST/PATCH = OWNER/ADMIN, GET = OWNER/ADMIN, DELETE = OWNER
router.post('/', requireAdmin, StaffController.createStaff);
router.get('/', requireAdmin, StaffController.getStaffList);
router.get('/:id', requireAdmin, StaffController.getStaffDetails);
router.patch('/:id', requireAdmin, StaffController.updateStaff);

export default router;
