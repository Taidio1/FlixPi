import * as progressService from '../services/progressService.js';

/**
 * Get watch progress for a movie
 */
export const getProgress = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { profileId } = req.query;

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }

    const progress = await progressService.getProgress(profileId, movieId);

    res.json(progress || { progress_seconds: 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * Update watch progress
 */
export const updateProgress = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { profileId, progressSeconds, totalDuration } = req.body;

    if (!profileId || progressSeconds === undefined) {
      return res.status(400).json({ error: 'Profile ID and progress are required' });
    }

    const progress = await progressService.updateProgress(
      profileId,
      movieId,
      progressSeconds,
      totalDuration
    );

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all progress for a profile
 */
export const getProfileProgress = async (req, res, next) => {
  try {
    const { profileId } = req.query;

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }

    const progress = await progressService.getProfileProgress(profileId);

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete progress
 */
export const deleteProgress = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { profileId } = req.query;

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }

    await progressService.deleteProgress(profileId, movieId);

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  getProgress,
  updateProgress,
  getProfileProgress,
  deleteProgress
};

