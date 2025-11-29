import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Button } from './ui/button';

const MovieCarousel = ({ title, movies, onPlay, onShowDetails }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 md:mb-12" data-testid={`carousel-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 px-4 md:px-6">
        {title}
      </h2>

      {/* Scrollable Container with Buttons */}
      <div className="relative px-4 md:px-6">
        {/* Scroll Buttons - Desktop Only - Always Visible */}
        <Button
          size="icon"
          variant="secondary"
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 bg-background/95 backdrop-blur-sm hover:bg-accent hover:scale-110 border-border h-14 w-14 shadow-xl rounded-full"
          data-testid={`button-scroll-left-${title}`}
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 bg-background/95 backdrop-blur-sm hover:bg-accent hover:scale-110 border-border h-14 w-14 shadow-xl rounded-full"
          data-testid={`button-scroll-right-${title}`}
        >
          <ChevronRight className="w-7 h-7" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start">
              <MovieCard
                movie={movie}
                onPlay={onPlay}
                onShowDetails={onShowDetails}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;
