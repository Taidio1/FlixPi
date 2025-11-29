import { useState, useEffect } from "react";
import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import api from "../services/api";

interface SeriesEpisodeSelectorProps {
  seriesId: string;
  seasons: any[];
  onPlayEpisode: (seasonNumber: number, episodeNumber: number) => void;
}

export function SeriesEpisodeSelector({
  seriesId,
  seasons,
  onPlayEpisode,
}: SeriesEpisodeSelectorProps) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seasons && seasons.length > 0) {
      loadEpisodes(seasons[selectedSeasonIndex].id);
    }
  }, [selectedSeasonIndex, seasons]);

  const loadEpisodes = async (seasonId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/seasons/${seasonId}/episodes`);
      setEpisodes(response.data || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  if (!seasons || seasons.length === 0) {
    return <p className="text-muted-foreground">Brak dostępnych sezonów</p>;
  }

  const currentSeason = seasons[selectedSeasonIndex];

  return (
    <div className="space-y-4">
      {/* Season Selector */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Wybierz sezon
        </label>
        <Select
          value={selectedSeasonIndex.toString()}
          onValueChange={(value) => setSelectedSeasonIndex(parseInt(value))}
        >
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Wybierz sezon" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season, index) => (
              <SelectItem key={season.id} value={index.toString()}>
                Sezon {season.season_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episodes List */}
      <div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Ładowanie odcinków...</p>
        ) : (
          <>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Odcinki ({episodes.length})
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {episodes.map((episode) => (
                <Card
                  key={episode.id}
                  className="p-3 md:p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() =>
                    onPlayEpisode(currentSeason.season_number, episode.episode_number)
                  }
            >
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Episode Thumbnail */}
                    {episode.thumbnail_url && (
                      <div className="flex-shrink-0 w-full sm:w-[140px] md:w-[160px] aspect-video rounded-md overflow-hidden bg-muted relative">
                        <img
                          src={episode.thumbnail_url}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    )}

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold text-foreground">
                              {episode.episode_number}
                            </span>
                            <h5 className="text-sm md:text-base font-semibold text-foreground line-clamp-1">
                              {episode.title}
                            </h5>
                          </div>
                          {episode.duration_minutes && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="w-3 h-3" />
                              <span>{episode.duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="hidden sm:flex"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayEpisode(
                              currentSeason.season_number,
                              episode.episode_number
                            );
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Odtwórz
                        </Button>
                      </div>
                      {episode.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {episode.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
