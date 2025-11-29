import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Movie } from "@shared/schema";
import { MovieCard } from "./MovieCard";
import { Button } from "@/components/ui/button";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onShowDetails: (movie: Movie) => void;
}

export function MovieCarousel({ title, movies, onPlay, onShowDetails }: MovieCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
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
    <div className="relative group/carousel mb-8 md:mb-12" data-testid={`carousel-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 px-4 md:px-6">
        {title}
      </h2>

      {/* Scroll Buttons - Desktop Only */}
      <Button
        size="icon"
        variant="secondary"
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90"
        data-testid={`button-scroll-left-${title}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90"
        data-testid={`button-scroll-right-${title}`}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-6 snap-x snap-mandatory"
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
  );
}
