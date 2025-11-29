import { useState, useEffect } from "react";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner({ movies, onPlay, onShowDetails }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) {
    return null;
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden" data-testid="hero-banner">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdrop_url || currentMovie.poster_url}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-center md:justify-end pb-24 md:pb-24">
        <div className="max-w-2xl">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4 drop-shadow-lg"
            data-testid="hero-title"
          >
            {currentMovie.title}
          </h1>

          <p className="text-sm md:text-lg text-foreground/90 mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 drop-shadow-md">
            {currentMovie.description}
          </p>

          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-xs md:text-sm text-foreground/80">
            {currentMovie.year && <span className="font-semibold">{currentMovie.year}</span>}
            {currentMovie.year && <span>•</span>}
            {(currentMovie.duration || currentMovie.duration_minutes) && (
              <>
                <span>{currentMovie.duration || currentMovie.duration_minutes}m</span>
                <span>•</span>
              </>
            )}
            {currentMovie.rating && (
              <div className="flex items-center gap-1">
                <span className="text-accent">★</span>
                <span className="font-semibold">{parseFloat(currentMovie.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 max-w-md">
            <Button
              size="lg"
              variant="default"
              onClick={() => onPlay(currentMovie)}
              className="w-full sm:w-auto sm:min-w-[140px] h-12 md:h-10"
              data-testid="button-play-hero"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onShowDetails(currentMovie)}
              className="w-full sm:w-auto sm:min-w-[140px] h-12 md:h-10 bg-background/60 backdrop-blur-sm hover:bg-background/80"
              data-testid="button-info-hero"
            >
              <Info className="w-5 h-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-primary w-6"
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
            data-testid={`hero-indicator-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
