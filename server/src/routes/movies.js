import express from 'express';
import * as movieController from '../controllers/movieController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public/authenticated routes
router.get('/', authenticate, movieController.getMovies);
router.get('/:id', authenticate, movieController.getMovie);
router.get('/:id/stream', authenticate, movieController.getStreamUrl);
router.get('/:id/subtitles', authenticate, movieController.getSubtitles);

// Stream video - NO AUTH (already checked when getting URL)
// Video.js can't send Authorization header, so we skip auth here
router.get('/:id/stream-video', movieController.streamMovie);
router.get('/:id/stream-subtitles', movieController.streamSubtitles);

// Admin only routes
router.post('/', authenticate, isAdmin, movieController.createMovie);
router.put('/:id', authenticate, isAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, isAdmin, movieController.deleteMovie);

export default router;

