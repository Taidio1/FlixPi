import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getCurrentUser();
    const storedProfile = authService.getCurrentProfile();
    
    if (storedUser) {
      setUser(storedUser);
      setCurrentProfile(storedProfile);
      loadProfiles();
    }
    
    setLoading(false);
  }, []);

  const loadProfiles = async () => {
    try {
      const userProfiles = await authService.getProfiles();
      setProfiles(userProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    await loadProfiles();
    return data;
  };

  const register = async (email, password, fullName) => {
    const data = await authService.register(email, password, fullName);
    setUser(data.user);
    await loadProfiles();
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentProfile(null);
    setProfiles([]);
  };

  const selectProfile = async (profileId) => {
    const profile = await authService.selectProfile(profileId);
    setCurrentProfile(profile);
    return profile;
  };

  const createProfile = async (name, avatarColor) => {
    const profile = await authService.createProfile(name, avatarColor);
    await loadProfiles();
    return profile;
  };

  const value = {
    user,
    currentProfile,
    profiles,
    loading,
    login,
    register,
    logout,
    selectProfile,
    createProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

