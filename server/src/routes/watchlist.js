import express from 'express';
import * as watchlistController from '../controllers/watchlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, watchlistController.getUserWatchlist);
router.post('/', authenticate, watchlistController.addToWatchlist);
router.delete('/:movieId', authenticate, watchlistController.removeFromWatchlist);

export default router;

