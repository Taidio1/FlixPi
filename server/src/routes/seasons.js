import express from 'express';
import * as contentController from '../controllers/contentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Season routes
router.get('/:seasonId/episodes', authenticate, contentController.getEpisodes);

export default router;

