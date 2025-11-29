import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import HeroBanner from '../components/HeroBanner';
import MovieCarousel from '../components/MovieCarousel';
import MovieDetailModal from '../components/MovieDetailModal';
import { useToast } from '../hooks/use-toast';
import { watchlistService } from '../services/watchlistService';

// Predefiniowane kategorie - próbujemy dopasować do tych najpierw
const predefinedCategories = [
  "Trending",
  "New Releases",
  "All Movies",
  "TV Series",
  "Action",
  "Akcja", // Polski
  "Drama",
  "Dramat", // Polski
  "Comedy",
  "Komedia", // Polski
  "Horror",
  "Sci-Fi",
  "Science Fiction",
  "Romance",
  "Romantic",
  "Thriller",
  "Documentary",
  "Dokumentalny", // Polski
  "Fantasy",
  "Fantastyka", // Polski
  "Adventure",
  "Przygodowy" // Polski
];

const Home = () => {
  const { currentProfile } = useAuth();
  const { movies, loading, loadMovies } = useMovies();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [watchlist, setWatchlist] = useState([]);

  const loadWatchlist = async () => {
    try {
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      // Ignorujemy błędy watchlist - nie jest krytyczne
    }
  };

  useEffect(() => {
    if (!currentProfile) {
      navigate('/profiles');
      return;
    }

    // Zawsze reload filmów przy montowaniu komponentu
    // To zapewnia odświeżenie po powrocie z Player
    console.log('[Home] Loading movies and watchlist');
    loadMovies();
    loadWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  useEffect(() => {
    console.log('📊 Movies loaded:', movies.length);
    if (movies.length > 0) {
      console.log('📋 Sample movie:', movies[0]);
      const allCategories = [...new Set(movies.map(m => m.category).filter(Boolean))];
      console.log('🏷️ Available categories in DB:', allCategories);
      console.log('🎯 Categories we are looking for:', predefinedCategories);

      // Sprawdź ile filmów pasuje do każdej kategorii
      predefinedCategories.forEach(cat => {
        const count = movies.filter(m => {
          if (cat === "Trending") {
            return (m.rating && parseFloat(m.rating) >= 4.5) || m.category === 'Trending' || m.isTrending;
          }
          if (cat === "New Releases") {
            return m.year && parseInt(m.year) >= 2024;
          }
          if (cat === "All Movies") {
            return true; // Show everything in All Movies
          }
          if (cat === "TV Series") {
            return m.content_type === 'series' || m.type === 'series';
          }
          // Check category OR genres
          return m.category === cat || (m.genres && m.genres.includes(cat));
        }).length;
        console.log(`  ${cat}: ${count} movies`);
      });
    }
  }, [movies]);

  // Featured movies dla hero banner - jak w StreamAppUI (isFeatured === 1)
  let featuredMovies = movies.filter((m) =>
    m.isFeatured === 1 ||
    m.isTrending ||
    (m.rating && parseFloat(m.rating) >= 4.5)
  ).slice(0, 5);

  // Fallback: jeśli brak featured, użyj pierwszych 5 filmów
  if (featuredMovies.length === 0 && movies.length > 0) {
    featuredMovies = movies.slice(0, 5);
    console.log('⚠️ No featured movies found, using first 5 movies');
  }

  // Dynamiczne kategorie - użyj kategorii z bazy danych + specjalne kategorie
  const dbCategories = [...new Set(movies.flatMap(m => m.genres || []).concat(movies.map(m => m.category).filter(Boolean)))];
  const allCategories = [
    ...predefinedCategories.filter(cat => {
      // Sprawdź czy kategoria ma jakieś filmy
      const hasMovies = movies.some(m => {
        if (cat === "Trending") return (m.rating && parseFloat(m.rating) >= 4.5) || m.category === 'Trending' || m.isTrending;
        if (cat === "New Releases") return m.year && parseInt(m.year) >= 2024;
        if (cat === "All Movies") return true;
        if (cat === "TV Series") return m.content_type === 'series' || m.type === 'series';
        return m.category === cat || (m.genres && m.genres.includes(cat));
      });
      return hasMovies;
    }),
    // Dodaj kategorie z bazy, których nie ma w predefinedCategories
    ...dbCategories.filter(cat => !predefinedCategories.includes(cat))
  ];

  useEffect(() => {
    console.log('🎬 Featured movies:', featuredMovies.length, featuredMovies.map(m => m.title));
    console.log('📋 All categories to display:', allCategories);
  }, [movies]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="text-center">
          <p className="text-muted-foreground text-xl mb-4">No movies found</p>
          <p className="text-muted-foreground">Please check if backend is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* Hero Banner - dokładnie jak w StreamAppUI */}
      <HeroBanner
        movies={featuredMovies}
        onPlay={handlePlay}
        onShowDetails={handleShowDetails}
      />

      {/* Carousels - dokładnie jak w StreamAppUI */}
      <div className="pt-6">
        {allCategories.map((category) => {
          // Filtrowanie - dokładnie jak w StreamAppUI
          const categoryMovies = movies.filter((m) => {
            try {
              if (category === "Trending") {
                return (m.rating && parseFloat(m.rating) >= 4.5) || m.category === 'Trending' || m.isTrending;
              }
              if (category === "New Releases") {
                return m.year && parseInt(m.year) >= 2024;
              }
              if (category === "All Movies") {
                return true;
              }
              if (category === "TV Series") {
                return m.content_type === 'series' || m.type === 'series';
              }
              return m.category === category || (m.genres && m.genres.includes(category));
            } catch (e) {
              console.error('Error filtering movie:', e);
              return false;
            }
          });

          if (categoryMovies.length === 0) return null;

          return (
            <MovieCarousel
              key={category}
              title={category}
              movies={categoryMovies}
              onPlay={handlePlay}
              onShowDetails={handleShowDetails}
            />
          );
        })}
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

export default Home;
