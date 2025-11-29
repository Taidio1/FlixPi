import { createContext, useContext, useState, useCallback } from 'react';
import { movieService } from '../services/movieService';

const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await movieService.getMovies(searchQuery, selectedGenre);
      setMovies(data || []);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error loading movies:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGenre]);

  const searchMovies = async (query) => {
    setSearchQuery(query);
  };

  const filterByGenre = async (genre) => {
    setSelectedGenre(genre);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
  };

  const value = {
    movies,
    loading,
    error,
    searchQuery,
    selectedGenre,
    loadMovies,
    searchMovies,
    filterByGenre,
    clearFilters,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

export default MovieContext;

