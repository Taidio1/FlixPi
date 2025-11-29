import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import progressRoutes from './routes/progress.js';
import syncRoutes from './routes/sync.js';
import contentRoutes from './routes/content.js';
import episodeRoutes from './routes/episodes.js';
import seasonRoutes from './routes/seasons.js';
import watchlistRoutes from './routes/watchlist.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow all localhost ports in development
const allowedOrigins = process.env.NODE_ENV === 'development' 
  ? (origin, callback) => {
      // Allow any localhost origin in development
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  : process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Debug middleware - log all requests
app.use('/api/', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  console.log(`[API] Path: ${req.path}, Base: ${req.baseUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
console.log('[Server] Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/watchlist', watchlistRoutes);
console.log('[Server] All routes registered');

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FlixPi Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

export default app;

