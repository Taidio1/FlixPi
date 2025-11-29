import api from './api';

export const authService = {
  // Register new user
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      fullName,
    });
    
    if (response.data.session) {
      localStorage.setItem('access_token', response.data.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.session) {
      localStorage.setItem('access_token', response.data.session.access_token);
      // TEMPORARY: Force is_admin for testing
      const userData = { ...response.data.user, is_admin: true };
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return response.data;
  },

  // Logout user
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('current_profile');
  },

  // Get user profiles
  getProfiles: async () => {
    const response = await api.get('/auth/profiles');
    return response.data;
  },

  // Create new profile
  createProfile: async (name, avatarColor) => {
    const response = await api.post('/auth/profiles', {
      name,
      avatarColor,
    });
    return response.data;
  },

  // Select profile
  selectProfile: async (profileId) => {
    const response = await api.put(`/auth/profiles/${profileId}`);
    localStorage.setItem('current_profile', JSON.stringify(response.data));
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get current profile from localStorage
  getCurrentProfile: () => {
    const profile = localStorage.getItem('current_profile');
    return profile ? JSON.parse(profile) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;

