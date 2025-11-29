import { useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';

const SeriesEpisodeSelector = ({
  seasons,
  onPlayEpisode,
}) => {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  if (!seasons || seasons.length === 0) {
    return <p className="text-gray-400">Brak dostępnych sezonów</p>;
  }

  const currentSeason = seasons[selectedSeasonIndex];

  return (
    <div className="space-y-4">
      {/* Season Selector */}
      <div>
        <label className="text-sm font-medium text-white mb-2 block">
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
              <SelectItem key={season.seasonNumber} value={index.toString()}>
                {season.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episodes List */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">
          Odcinki ({currentSeason.episodes.length})
        </h4>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {currentSeason.episodes.map((episode) => (
            <Card
              key={episode.episodeNumber}
              className="p-3 md:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group bg-gray-800 border-gray-700"
              onClick={() =>
                onPlayEpisode(currentSeason.seasonNumber, episode.episodeNumber)
              }
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Episode Thumbnail */}
                {episode.thumbnailUrl && (
                  <div className="flex-shrink-0 w-full sm:w-[140px] md:w-[160px] aspect-video rounded-md overflow-hidden bg-gray-700 relative">
                    <img
                      src={episode.thumbnailUrl}
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
                        <span className="text-lg font-semibold text-white">
                          {episode.episodeNumber}
                        </span>
                        <h5 className="text-sm md:text-base font-semibold text-white line-clamp-1">
                          {episode.title}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{episode.duration} min</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="hidden sm:flex bg-gray-700 hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayEpisode(
                          currentSeason.seasonNumber,
                          episode.episodeNumber
                        );
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Odtwórz
                    </Button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 line-clamp-2">
                    {episode.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesEpisodeSelector;
