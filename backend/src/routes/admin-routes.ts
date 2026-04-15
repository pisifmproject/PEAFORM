import { Router } from 'express';
import * as adminController from '../controllers/admin-controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/users', authenticate, adminController.getUsers);
router.put('/users/:id/role', authenticate, adminController.updateUserRole);
router.put('/users/:id/plant', authenticate, adminController.updateUserPlant);
router.delete('/users/:id', authenticate, adminController.deleteUser);

export default router;
