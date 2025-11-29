import express from 'express';
import * as contentController from '../controllers/contentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Episode routes
router.get('/:id', authenticate, contentController.getEpisode);
router.get('/:id/stream', authenticate, contentController.getEpisodeStreamUrl);

// Stream video - NO AUTH (Video.js can't send headers)
router.get('/:id/stream-video', contentController.streamEpisode);

// Stream subtitles - NO AUTH (Video.js can't send headers)
router.get('/:id/stream-subtitles', contentController.streamEpisodeSubtitles);

export default router;

