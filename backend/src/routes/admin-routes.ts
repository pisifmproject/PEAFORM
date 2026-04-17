import { Router } from 'express';
import * as adminController from '../controllers/admin-controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/users', authenticate, adminController.getUsers);
router.put('/users/:id/role', authenticate, adminController.updateUserRole);
router.put('/users/:id/plant', authenticate, adminController.updateUserPlant);
router.delete('/users/:id', authenticate, adminController.deleteUser);

// Pending registrations
router.get('/pending-registrations', authenticate, adminController.getPendingRegistrations);
router.post('/pending-registrations/:id/approve', authenticate, adminController.approvePendingRegistration);
router.post('/pending-registrations/:id/reject', authenticate, adminController.rejectPendingRegistration);

export default router;
