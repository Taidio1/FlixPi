import { supabase } from '../config/supabase.js';

/**
 * Get watch progress for a movie and profile
 * @param {string} profileId - Profile ID
 * @param {string} movieId - Movie/Content ID
 * @returns {Promise<object|null>} - Progress data
 */
export const getProgress = async (profileId, movieId) => {
  const { data, error } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('profile_id', profileId)
    .eq('content_id', movieId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }

  return data;
};

/**
 * Update or create watch progress
 * @param {string} profileId - Profile ID
 * @param {string} movieId - Movie/Content ID
 * @param {number} progressSeconds - Progress in seconds
 * @param {number} totalDuration - Total duration in seconds
 * @returns {Promise<object>} - Updated progress
 */
export const updateProgress = async (profileId, movieId, progressSeconds, totalDuration) => {
  // First check if progress exists
  const { data: existing } = await supabase
    .from('watch_progress')
    .select('id')
    .eq('profile_id', profileId)
    .eq('content_id', movieId)
    .maybeSingle();

  let data, error;

  if (existing) {
    // Update existing
    ({ data, error } = await supabase
      .from('watch_progress')
      .update({
        progress_seconds: progressSeconds,
        total_duration: totalDuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single());
  } else {
    // Insert new
    ({ data, error } = await supabase
      .from('watch_progress')
      .insert({
        profile_id: profileId,
        content_id: movieId,
        progress_seconds: progressSeconds,
        total_duration: totalDuration
      })
      .select()
      .single());
  }

  if (error) throw error;
  return data;
};

/**
 * Get all watch progress for a profile
 * @param {string} profileId - Profile ID
 * @returns {Promise<Array>} - List of progress records
 */
export const getProfileProgress = async (profileId) => {
  const { data, error } = await supabase
    .from('watch_progress')
    .select('*, content(*)')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Delete watch progress
 * @param {string} profileId - Profile ID
 * @param {string} movieId - Movie/Content ID
 * @returns {Promise<void>}
 */
export const deleteProgress = async (profileId, movieId) => {
  const { error } = await supabase
    .from('watch_progress')
    .delete()
    .eq('profile_id', profileId)
    .eq('content_id', movieId);

  if (error) throw error;
};

export default {
  getProgress,
  updateProgress,
  getProfileProgress,
  deleteProgress
};

