import express from 'express';
import * as contentController from '../controllers/contentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

console.log('[ContentRoutes] Loaded with controllers:', Object.keys(contentController));

// Test route
router.get('/test', (req, res) => {
  console.log('[ContentRoutes] Test endpoint called');
  res.json({ message: 'Content routes working!' });
});

// Series routes - order matters!
router.get('/:id/seasons', authenticate, (req, res, next) => {
  console.log('[ContentRoutes] GET /:id/seasons called for ID:', req.params.id);
  contentController.getSeasons(req, res, next);
});

router.get('/:id', 
  (req, res, next) => {
    console.log('[ContentRoutes] ===== BEFORE AUTH =====');
    console.log('[ContentRoutes] ID param:', req.params.id);
    console.log('[ContentRoutes] URL:', req.originalUrl);
    next();
  },
  authenticate, 
  async (req, res, next) => {
    console.log('[ContentRoutes] ===== AFTER AUTH =====');
    console.log('[ContentRoutes] GET /:id called for ID:', req.params.id);
    console.log('[ContentRoutes] Controller function exists:', typeof contentController.getSeries);
  
  if (typeof contentController.getSeries !== 'function') {
    console.error('[ContentRoutes] getSeries is not a function!');
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  await contentController.getSeries(req, res, next);
});

console.log('[ContentRoutes] Router configured with', router.stack.length, 'routes');

export default router;

