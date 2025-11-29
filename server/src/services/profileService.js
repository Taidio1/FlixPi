import { supabase } from '../config/supabase.js';

/**
 * Get all profiles for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of profiles
 */
export const getUserProfiles = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get profile by ID
 * @param {string} profileId - Profile ID
 * @returns {Promise<object>} - Profile data
 */
export const getProfileById = async (profileId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create new profile
 * @param {string} userId - User ID
 * @param {string} name - Profile name
 * @param {string} avatarColor - Avatar color hex
 * @returns {Promise<object>} - Created profile
 */
export const createProfile = async (userId, name, avatarColor = '#FF0000') => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      user_id: userId,
      name,
      avatar_color: avatarColor
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update profile
 * @param {string} profileId - Profile ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated profile
 */
export const updateProfile = async (profileId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete profile
 * @param {string} profileId - Profile ID
 * @returns {Promise<void>}
 */
export const deleteProfile = async (profileId) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId);

  if (error) throw error;
};

export default {
  getUserProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile
};

