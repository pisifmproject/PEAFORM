import { Router } from 'express';
import * as notificationController from '../controllers/notification-controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.post('/:id/read', authenticate, notificationController.markNotificationAsRead);
router.post('/read-all', authenticate, notificationController.markAllNotificationsAsRead);

export default router;
