import { useState } from "react";
import { X, Play, Star, Plus, Check, Tv, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SeriesEpisodeSelector } from "./SeriesEpisodeSelector";
import { useToast } from "@/hooks/use-toast";

interface MovieDetailModalProps {
  movie: any | null;
  open: boolean;
  onClose: () => void;
  onPlay: (movie: any) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: () => void;
}

export function MovieDetailModal({
  movie,
  open,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
}: MovieDetailModalProps) {
  const { toast } = useToast();
  const isSeries = movie?.content_type === "series";

  const handlePlayEpisode = (seasonNumber: number, episodeNumber: number) => {
    toast({
      title: "Odtwarzanie odcinka",
      description: `Sezon ${seasonNumber}, Odcinek ${episodeNumber}`,
    });
  };

  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-card" data-testid="movie-detail-modal">
        {/* Backdrop Image */}
        <div className="relative w-full h-[300px] md:h-[400px]">
          <img
            src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          
          {/* Close Button */}
          <Button
            size="icon"
            variant="secondary"
            onClick={onClose}
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <DialogHeader className="px-6 pb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster - Desktop Only */}
            <div className="hidden md:block flex-shrink-0 w-[180px]">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full rounded-md shadow-lg"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="modal-title">
                  {movie.title}
                </h2>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
                  <Badge variant={isSeries ? "default" : "secondary"} className="gap-1">
                    {isSeries ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                    {isSeries ? "Serial" : "Film"}
                  </Badge>
                  {movie.rating && (
                    <>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-semibold text-foreground">{parseFloat(movie.rating).toFixed(1)}</span>
                      </div>
                      <span>•</span>
                    </>
                  )}
                  {movie.year && <span>{movie.year}</span>}
                  {movie.duration_minutes && (
                    <>
                      <span>•</span>
                      <span>{movie.duration_minutes}m</span>
                    </>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" data-testid={`genre-${genre}`}>
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons - tylko dla filmów */}
              {!isSeries && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => onPlay(movie)}
                    className="min-w-[140px]"
                    data-testid="button-play-modal"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Odtwórz
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={onToggleWatchlist}
                    data-testid="button-watchlist-toggle"
                  >
                    {isInWatchlist ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Na liście
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Dodaj do listy
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Watchlist button for series */}
              {isSeries && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={onToggleWatchlist}
                    data-testid="button-watchlist-toggle"
                  >
                    {isInWatchlist ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Na liście
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Dodaj do listy
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Synopsis */}
              {movie.description && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Opis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {movie.description}
                  </p>
                </div>
              )}

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Obsada</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.slice(0, 6).map((actor) => (
                      <Badge key={actor} variant="outline">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Episode Selector for Series */}
              {isSeries && movie.series_data?.seasons && movie.series_data.seasons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Odcinki</h3>
                  <SeriesEpisodeSelector
                    seriesId={movie.id}
                    seasons={movie.series_data.seasons}
                    onPlayEpisode={handlePlayEpisode}
                  />
                </div>
              )}

              {/* Mock Trailer Player - tylko dla filmów */}
              {!isSeries && (
                <div className="bg-muted rounded-md aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Zwiastun</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default MovieDetailModal;
