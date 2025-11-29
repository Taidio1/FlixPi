import { Star, Play, Info, Tv, Film } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const MovieCard = ({ movie, onPlay, onShowDetails }) => {
  const isSeries = movie.content_type === 'series';

  return (
    <div
      className="group relative flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] transition-transform duration-300 hover:scale-105 hover:z-10"
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-card shadow-md">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Content Type Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant={isSeries ? "default" : "secondary"} className="gap-1 text-xs">
            {isSeries ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
            {isSeries ? "Serial" : "Film"}
          </Badge>
        </div>
        
        {/* Overlay on hover/tap */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm font-semibold text-foreground">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
          </div>
          
          <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-foreground/80 mb-3">
            <span>{movie.year}</span>
            <span>•</span>
            {isSeries && movie.series_data?.seasons ? (
              <span>{movie.series_data.seasons.length} {movie.series_data.seasons.length === 1 ? "sezon" : "sezonów"}</span>
            ) : (
              <span>{movie.duration}m</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="flex-1"
              data-testid={`button-play-${movie.id}`}
            >
              <Play className="w-4 h-4 mr-1" />
              {isSeries ? "Zobacz" : "Odtwórz"}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(movie);
              }}
              className="hover-elevate"
              data-testid={`button-info-${movie.id}`}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;