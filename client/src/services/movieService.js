import api from './api';

export const movieService = {
  // Get all movies
  getMovies: async (search = '', genre = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    
    const response = await api.get(`/movies?${params.toString()}`);
    return response.data;
  },

  // Get movie by ID
  getMovie: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  // Get streaming URL
  getStreamUrl: async (id) => {
    const response = await api.get(`/movies/${id}/stream`);
    return response.data;
  },

  // Get subtitles
  getSubtitles: async (id) => {
    try {
      const response = await api.get(`/movies/${id}/subtitles`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Create movie (admin only)
  createMovie: async (movieData) => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  // Update movie (admin only)
  updateMovie: async (id, movieData) => {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  // Delete movie (admin only)
  deleteMovie: async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },
};

export default movieService;

