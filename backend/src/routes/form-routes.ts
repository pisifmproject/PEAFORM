import { Router } from 'express';
import * as formController from '../controllers/form-controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/', authenticate, formController.createForm);
router.get('/', authenticate, formController.getForms);
router.get('/:id', authenticate, formController.getFormById);
router.post('/:id/approve', authenticate, formController.approveForm);

export default router;
