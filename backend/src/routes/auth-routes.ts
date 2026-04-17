import { Router } from 'express';
import * as authController from '../controllers/auth-controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
