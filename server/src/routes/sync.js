import express from 'express';
import * as syncController from '../controllers/syncController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All sync routes require admin authentication
router.post('/movies', authenticate, isAdmin, syncController.syncMovies);
router.post('/series', authenticate, isAdmin, syncController.syncSeries);
router.post('/all', authenticate, isAdmin, syncController.syncAll);

export default router;

