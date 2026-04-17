import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { requireAdmin, requireTeacher } from '../middleware/rbac.middleware';

const router = Router();

// Docs RBAC: POST = OWNER/ADMIN, GET = OWNER/ADMIN/TEACHER
router.post('/enroll', requireAdmin, StudentController.enroll);
router.get('/', requireTeacher, StudentController.list);
router.get('/:id', requireTeacher, StudentController.getById);
router.patch('/:id', requireAdmin, StudentController.update);

export default router;
