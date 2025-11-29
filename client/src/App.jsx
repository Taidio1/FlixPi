import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import { Toaster } from './components/ui/toaster';
import Navigation from './components/Navigation';

import Login from './pages/Login';
import Profiles from './pages/Profiles';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import MovieDetail from './pages/MovieDetail';
import SeriesDetail from './pages/SeriesDetail';
import Player from './pages/Player';
import EpisodePlayer from './pages/EpisodePlayer';
import Admin from './pages/Admin';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-flix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/profiles"
        element={
          <ProtectedRoute>
            <Profiles />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/watchlist"
        element={
          <ProtectedRoute>
            <WatchlistPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/movie/:id"
        element={
          <ProtectedRoute>
            <MovieDetail />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/series/:id"
        element={
          <ProtectedRoute>
            <SeriesDetail />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/watch/:id"
        element={
          <ProtectedRoute>
            <Player />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/watch/episode/:episodeId"
        element={
          <ProtectedRoute>
            <EpisodePlayer />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MovieProvider>
          <AppContent />
          <Toaster />
        </MovieProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

