import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Get all content (movies + series)
 * @returns {Promise<Array>} - List of content
 */
export const getAllMovies = async () => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get content by ID (movie or series)
 * @param {string} id - Content ID
 * @returns {Promise<object>} - Content details
 */
export const getMovieById = async (id) => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create new movie (admin only)
 * @param {object} movieData - Movie data
 * @returns {Promise<object>} - Created movie
 */
export const createMovie = async (movieData) => {
  // Ensure content_type is set for movies
  const dataWithType = {
    ...movieData,
    content_type: 'movie'
  };
  
  const { data, error } = await supabaseAdmin
    .from('content')
    .insert([dataWithType])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update movie (admin only)
 * @param {string} id - Movie ID
 * @param {object} movieData - Updated movie data
 * @returns {Promise<object>} - Updated movie
 */
export const updateMovie = async (id, movieData) => {
  const { data, error } = await supabaseAdmin
    .from('content')
    .update(movieData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete movie (admin only)
 * @param {string} id - Movie ID
 * @returns {Promise<void>}
 */
export const deleteMovie = async (id) => {
  const { error } = await supabaseAdmin
    .from('content')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Search movies by title or genre
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching movies
 */
export const searchMovies = async (query) => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export default {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies
};

