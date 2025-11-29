import api from './api';

export const progressService = {
  // Get progress for a movie
  getProgress: async (movieId, profileId) => {
    const response = await api.get(`/progress/${movieId}?profileId=${profileId}`);
    return response.data;
  },

  // Update progress
  updateProgress: async (movieId, profileId, progressSeconds, totalDuration) => {
    const response = await api.put(`/progress/${movieId}`, {
      profileId,
      progressSeconds,
      totalDuration,
    });
    return response.data;
  },

  // Get all progress for profile
  getProfileProgress: async (profileId) => {
    const response = await api.get(`/progress?profileId=${profileId}`);
    return response.data;
  },

  // Delete progress
  deleteProgress: async (movieId, profileId) => {
    const response = await api.delete(`/progress/${movieId}?profileId=${profileId}`);
    return response.data;
  },
};

export default progressService;

