import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Navbar = () => {
  const { user, currentProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (currentProfile) {
        try {
          // Check if current profile has admin role
          const response = await api.get(`/auth/profiles`);
          const profiles = response.data;
          const adminProfile = profiles.find(p => p.id === currentProfile.id && p.role === 'admin');
          setIsAdmin(!!adminProfile);
        } catch (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminRole();
  }, [currentProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profiles');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-flix-red text-3xl font-bold tracking-wider">
              FLIXPI
            </Link>
            
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
                >
                  Browse
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Current Profile */}
              {currentProfile && (
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: currentProfile.avatar_color }}
                  >
                    {currentProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm">{currentProfile.name}</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

