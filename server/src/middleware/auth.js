import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Middleware to verify Supabase JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    console.log('[Auth] Authenticating request to:', req.originalUrl);
    
    // Check if test data mode is enabled
    if (process.env.USE_TEST_DATA === 'true') {
      console.log('[Auth] Test data mode enabled - skipping authentication');
      // Create a mock user for test mode
      req.user = {
        id: 'test-user-id',
        email: 'test@flixpi.com'
      };
      req.token = 'test-token';
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth] No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    console.log('[Auth] User authenticated:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = async (req, res, next) => {
  try {
    // Check if test data mode is enabled
    if (process.env.USE_TEST_DATA === 'true') {
      console.log('[Auth] Test data mode - granting admin access');
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if ANY of user's profiles has admin role (use admin client to bypass RLS)
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to check admin role' });
    }

    if (!profiles || profiles.length === 0) {
      return res.status(403).json({ error: 'No profiles found' });
    }

    // Check if any profile has admin role
    const hasAdminRole = profiles.some(p => p.role === 'admin');

    if (!hasAdminRole) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

