import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { tenantContextMiddleware } from '../middleware/tenantContext.middleware';

const router = Router();

router.use(tenantContextMiddleware);

router.post('/enroll', StudentController.enroll);
router.get('/', StudentController.list);
router.get('/:id', StudentController.getById);
router.put('/:id', StudentController.update);

export default router;
