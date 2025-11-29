import { supabase } from '../config/supabase.js';
import * as profileService from '../services/profileService.js';

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });

    if (error) throw error;

    // Create default profile
    if (data.user) {
      await profileService.createProfile(
        data.user.id,
        fullName || 'Default',
        '#FF0000'
      );
    }

    res.status(201).json({
      user: data.user,
      session: data.session,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if test data mode is enabled
    if (process.env.USE_TEST_DATA === 'true') {
      console.log('[Auth] Test data mode - mock login');
      // Return mock user and session
      const mockUser = {
        id: 'test-user-id',
        email: email,
        user_metadata: {
          full_name: email.split('@')[0]
        }
      };
      
      const mockSession = {
        access_token: 'test-access-token-' + Date.now(),
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'bearer'
      };

      return res.json({
        user: mockUser,
        session: mockSession
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    // Check if test data mode is enabled
    if (process.env.USE_TEST_DATA === 'true') {
      console.log('[Auth] Test data mode - mock logout');
      return res.json({ message: 'Logged out successfully' });
    }

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all profiles for current user
 */
export const getProfiles = async (req, res, next) => {
  try {
    // Check if test data mode is enabled
    if (process.env.USE_TEST_DATA === 'true') {
      console.log('[Auth] Test data mode - mock profiles');
      return res.json([{
        id: 'test-profile-1',
        name: 'Test Profile',
        avatar_color: '#FF0000',
        role: 'user',
        user_id: 'test-user-id'
      }]);
    }

    const userId = req.user.id;
    const profiles = await profileService.getUserProfiles(userId);

    res.json(profiles);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new profile
 */
export const createProfile = async (req, res, next) => {
  try {
    const { name, avatarColor } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Profile name is required' });
    }

    // Check profile limit (max 5 profiles per user)
    const existingProfiles = await profileService.getUserProfiles(userId);
    if (existingProfiles.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 profiles allowed' });
    }

    const profile = await profileService.createProfile(userId, name, avatarColor);

    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Select active profile
 */
export const selectProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if test data mode is enabled
    if (process.env.USE_TEST_DATA === 'true') {
      console.log('[Auth] Test data mode - mock profile selection');
      return res.json({
        id: id,
        name: 'Test Profile',
        avatar_color: '#FF0000',
        role: 'user',
        user_id: 'test-user-id'
      });
    }

    const userId = req.user.id;

    // Verify profile belongs to user
    const profile = await profileService.getProfileById(id);

    if (!profile || profile.user_id !== userId) {
      return res.status(403).json({ error: 'Profile not found or access denied' });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  getProfiles,
  createProfile,
  selectProfile
};

