import api from './api';

export const watchlistService = {
  // Get user's watchlist
  getWatchlist: async () => {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return [];
    }
  },

  // Add movie to watchlist
  addToWatchlist: async (movieId) => {
    const response = await api.post('/watchlist', { movie_id: movieId });
    return response.data;
  },

  // Remove movie from watchlist
  removeFromWatchlist: async (movieId) => {
    const response = await api.delete(`/watchlist/${movieId}`);
    return response.data;
  },

  // Check if movie is in watchlist
  isInWatchlist: async (movieId) => {
    try {
      const watchlist = await watchlistService.getWatchlist();
      return watchlist.some(item => item.movie_id === movieId);
    } catch (error) {
      return false;
    }
  },
};

export default watchlistService;

