import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { watchlistService } from '../services/watchlistService';
import MovieCard from '../components/MovieCard';
import MovieDetailModal from '../components/MovieDetailModal';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

const categories = [
  "Action",
  "Drama",
  "Comedy",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Documentary"
];

const SearchPage = () => {
  const { currentProfile } = useAuth();
  const { movies, loading } = useMovies();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles');
      return;
    }
    loadWatchlist();
  }, [currentProfile, navigate]);

  const loadWatchlist = async () => {
    try {
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || movie.category === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const allGenres = Array.from(new Set(movies.map(m => m.category).filter(Boolean))).sort();

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
    const isInWatchlist = watchlist.some(item => item.movie_id === selectedMovie.id);

    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(selectedMovie.id);
        toast({
          title: "Removed from Watchlist",
          description: `${selectedMovie.title} has been removed`,
        });
      } else {
        await watchlistService.addToWatchlist(selectedMovie.id);
        toast({
          title: "Added to Watchlist",
          description: `${selectedMovie.title} has been added`,
        });
      }
      await loadWatchlist();
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive",
      });
    }
  };

  const isInWatchlist = selectedMovie
    ? watchlist.some(item => item.movie_id === selectedMovie.id)
    : false;

  return (
    <div className="pb-20 md:pb-8 pt-4 md:pt-20">

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="sticky top-4 md:top-20 z-40 mb-6 bg-background/95 backdrop-blur-sm py-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base bg-card"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Genres
          </h3>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            <Badge
              variant={selectedGenre === null ? "default" : "outline"}
              className="cursor-pointer hover-elevate active-elevate-2"
              onClick={() => setSelectedGenre(null)}
              data-testid="filter-all"
            >
              All
            </Badge>
            {allGenres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer hover-elevate active-elevate-2"
                onClick={() => setSelectedGenre(genre)}
                data-testid={`filter-${genre.toLowerCase()}`}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No movies found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredMovies.length} {filteredMovies.length === 1 ? "result" : "results"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMovies.map((movie) => (
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
        isInWatchlist={isInWatchlist}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
};

export default SearchPage;
