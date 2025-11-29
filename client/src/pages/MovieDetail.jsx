import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { progressService } from '../services/progressService';
import { useAuth } from '../contexts/AuthContext';
import MovieDetailModal from '../components/MovieDetailModal';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProfile } = useAuth();

  const [movie, setMovie] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        const movieData = await movieService.getMovie(id);
        
        // If it's a series, redirect to series page
        if (movieData && movieData.content_type === 'series') {
          navigate(`/series/${id}`);
          return;
        }
        
        setMovie(movieData);

        // Load watch progress if profile is selected
        if (currentProfile) {
          try {
            const progressData = await progressService.getProgress(id, currentProfile.id);
            setProgress(progressData);
          } catch (err) {
            console.log('No progress found for this movie');
          }
        }
      } catch (err) {
        setError('Failed to load movie details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [id, currentProfile]);

  const handlePlay = () => {
    navigate(`/watch/${id}`);
  };

  const handleShowDetails = () => {
    // Already showing details, just scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseModal = () => {
    navigate('/');
  };

  const getProgressPercentage = () => {
    if (!progress || !progress.total_duration) return 0;
    return Math.round((progress.progress_seconds / progress.total_duration) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">{error || 'Movie not found'}</div>
      </div>
    );
  }

  return (
    <div>
      
      {/* Use the new MovieDetailModal */}
      <MovieDetailModal
        movie={movie}
        open={true}
        onClose={handleCloseModal}
        onPlay={handlePlay}
        isInWatchlist={false} // TODO: implement watchlist
        onToggleWatchlist={() => {}} // TODO: implement watchlist
      />
    </div>
  );
};

export default MovieDetail;

