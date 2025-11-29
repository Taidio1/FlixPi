import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { watchlistService } from '../services/watchlistService';
import MovieCard from '../components/MovieCard';
import MovieDetailModal from '../components/MovieDetailModal';
import { useToast } from '../hooks/use-toast';

const WatchlistPage = () => {
  const { currentProfile } = useAuth();
  const { movies, loading: moviesLoading } = useMovies();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles');
      return;
    }
    loadWatchlist();
  }, [currentProfile, navigate]);

  const loadWatchlist = async () => {
    try {
      setWatchlistLoading(true);
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const watchlistMovies = movies.filter((movie) =>
    watchlist.some((item) => item.movie_id === movie.id)
  );

  const handlePlay = (movie) => {
    toast({
      title: "Now Playing",
      description: movie.title,
    });

    if (movie.content_type === 'series' || movie.type === 'series') {
      navigate(`/series/${movie.id}`);
    } else {
      navigate(`/watch/${movie.id}`);
    }
  };

  const handleShowDetails = (movie) => {
    setSelectedMovie(movie);
    setShowDetailModal(true);
  };

  const handleToggleWatchlist = async () => {
    if (!selectedMovie) return;
    
    try {
      await watchlistService.removeFromWatchlist(selectedMovie.id);
      toast({
        title: "Removed from Watchlist",
        description: `${selectedMovie.title} has been removed`,
      });
      await loadWatchlist();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    }
  };

  const isLoading = watchlistLoading || moviesLoading;

  return (
    <div className="pb-20 md:pb-8 pt-4 md:pt-20">

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Watchlist
          </h1>
          <p className="text-muted-foreground">
            Movies you want to watch later
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading watchlist...</p>
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-muted-foreground">
              Add movies to your watchlist to watch them later
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {watchlistMovies.length} {watchlistMovies.length === 1 ? "movie" : "movies"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistMovies.map((movie) => (
                <div key={movie.id} className="flex justify-center">
                  <MovieCard
                    movie={movie}
                    onPlay={handlePlay}
                    onShowDetails={handleShowDetails}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MovieDetailModal
        movie={selectedMovie}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onPlay={handlePlay}
        isInWatchlist={true}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
};

export default WatchlistPage;
