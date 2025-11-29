import * as driveSyncService from '../services/driveSyncService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sync movies from Google Drive
 */
export const syncMovies = async (req, res, next) => {
  try {
    const moviesFolderId = process.env.GOOGLE_DRIVE_MOVIES_FOLDER_ID;
    
    if (!moviesFolderId) {
      return res.status(400).json({ 
        error: 'GOOGLE_DRIVE_MOVIES_FOLDER_ID not configured in environment variables'
      });
    }
    
    const result = await driveSyncService.syncMoviesFromDrive(moviesFolderId);
    
    res.json({
      message: 'Movies synced successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync series from Google Drive
 */
export const syncSeries = async (req, res, next) => {
  try {
    const seriesFolderId = process.env.GOOGLE_DRIVE_SERIES_FOLDER_ID;
    
    if (!seriesFolderId) {
      return res.status(400).json({ 
        error: 'GOOGLE_DRIVE_SERIES_FOLDER_ID not configured in environment variables'
      });
    }
    
    const result = await driveSyncService.syncSeriesFromDrive(seriesFolderId);
    
    res.json({
      message: 'Series synced successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync both movies and series
 */
export const syncAll = async (req, res, next) => {
  try {
    const moviesFolderId = process.env.GOOGLE_DRIVE_MOVIES_FOLDER_ID;
    const seriesFolderId = process.env.GOOGLE_DRIVE_SERIES_FOLDER_ID;
    
    const results = {
      movies: null,
      series: null
    };
    
    // Sync movies if configured
    if (moviesFolderId) {
      try {
        results.movies = await driveSyncService.syncMoviesFromDrive(moviesFolderId);
      } catch (error) {
        console.error('Error syncing movies:', error);
        results.movies = { error: error.message };
      }
    }
    
    // Sync series if configured
    if (seriesFolderId) {
      try {
        results.series = await driveSyncService.syncSeriesFromDrive(seriesFolderId);
      } catch (error) {
        console.error('Error syncing series:', error);
        results.series = { error: error.message };
      }
    }
    
    res.json({
      message: 'Sync completed',
      results
    });
  } catch (error) {
    next(error);
  }
};

export default {
  syncMovies,
  syncSeries,
  syncAll
};

