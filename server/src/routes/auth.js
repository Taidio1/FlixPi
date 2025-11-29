import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profiles', authenticate, authController.getProfiles);
router.post('/profiles', authenticate, authController.createProfile);
router.put('/profiles/:id', authenticate, authController.selectProfile);

export default router;

