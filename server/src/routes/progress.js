import express from 'express';
import * as progressController from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/', authenticate, progressController.getProfileProgress);
router.get('/:movieId', authenticate, progressController.getProgress);
router.put('/:movieId', authenticate, progressController.updateProgress);
router.delete('/:movieId', authenticate, progressController.deleteProgress);

export default router;

