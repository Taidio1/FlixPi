import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    const loadSeriesData = async () => {
      try {
        setLoading(true);
        
        console.log('[SeriesDetail] Loading series ID:', id);
        
        // Get series info - try multiple approaches
        let seriesData = null;
        
        try {
          const seriesResponse = await api.get(`/content/${id}`);
          seriesData = seriesResponse.data;
          console.log('[SeriesDetail] Series loaded from /content:', seriesData);
        } catch (err) {
          console.log('[SeriesDetail] Failed to load from /content, trying /movies:', err.message);
          // Fallback to movies endpoint
          const fallbackResponse = await api.get(`/movies/${id}`);
          seriesData = fallbackResponse.data;
          console.log('[SeriesDetail] Series loaded from /movies:', seriesData);
        }
        
        setSeries(seriesData);

        // Get seasons
        try {
          const seasonsResponse = await api.get(`/content/${id}/seasons`);
          setSeasons(seasonsResponse.data);
          console.log('[SeriesDetail] Seasons loaded:', seasonsResponse.data.length);

          // Get episodes for each season
          const episodesData = {};
          for (const season of seasonsResponse.data) {
            try {
              console.log(`[SeriesDetail] Fetching episodes for season ${season.season_number}, ID: ${season.id}`);
              const episodesResponse = await api.get(`/seasons/${season.id}/episodes`);
              episodesData[season.season_number] = episodesResponse.data;
              
              console.log(`[SeriesDetail] Season ${season.season_number}:`, {
                seasonId: season.id,
                episodeCount: episodesResponse.data.length,
                episodes: episodesResponse.data.map(e => ({
                  id: e.id,
                  number: e.episode_number,
                  title: e.title,
                  driveFileId: e.google_drive_file_id
                }))
              });
            } catch (episodeErr) {
              console.error(`[SeriesDetail] Season ${season.season_number} error:`, {
                seasonId: season.id,
                error: episodeErr.message,
                response: episodeErr.response?.data,
                status: episodeErr.response?.status
              });
              episodesData[season.season_number] = [];
            }
          }
          setEpisodes(episodesData);

          if (seasonsResponse.data.length > 0) {
            setSelectedSeason(seasonsResponse.data[0].season_number);
          }
        } catch (seasonsErr) {
          console.error('[SeriesDetail] Failed to load seasons:', seasonsErr);
          setSeasons([]);
          setEpisodes({});
        }
      } catch (err) {
        console.error('[SeriesDetail] Error loading series:', err);
        // Don't throw - show page with error message
      } finally {
        setLoading(false);
      }
    };

    loadSeriesData();
  }, [id]);

  const handlePlayEpisode = (episodeId) => {
    navigate(`/watch/episode/${episodeId}`);
  };

  if (loading) {
    return (
      <div>
        <div className="pt-24 flex items-center justify-center">
          <div className="text-foreground text-xl">Loading series...</div>
        </div>
      </div>
    );
  }

  return (
    <div>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Error message if series not loaded */}
          {!series && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-4 mb-6">
              <p className="text-red-400">Unable to load series details. ID: {id}</p>
            </div>
          )}

          {/* Series Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              {series?.title || 'Series'}
            </h1>
            {series?.description && (
              <p className="text-gray-300 text-lg max-w-3xl mb-4">{series.description}</p>
            )}
            {series && (
              <div className="flex items-center gap-4 text-gray-400">
                {series.year && <span>{series.year}</span>}
                {series.total_seasons && (
                  <span>{series.total_seasons} Season{series.total_seasons > 1 ? 's' : ''}</span>
                )}
                {series.total_episodes && <span>{series.total_episodes} Episodes</span>}
              </div>
            )}
          </div>

          {/* Season Selector */}
          {seasons && seasons.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`px-6 py-3 rounded font-semibold transition-colors ${
                    selectedSeason === season.season_number
                      ? 'bg-flix-red text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Season {season.season_number}
                </button>
                ))}
              </div>
            </div>
          )}

          {/* Episodes List */}
          {seasons && seasons.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Season {selectedSeason} Episodes
              </h2>
              
              {episodes[selectedSeason] && episodes[selectedSeason].length > 0 ? (
              <div className="space-y-3">
                {episodes[selectedSeason].map((episode, idx) => (
                  <div
                    key={episode.id}
                    className="bg-flix-gray rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handlePlayEpisode(episode.id)}
                  >
                    {/* Episode Number */}
                    <div className="text-4xl font-bold text-gray-600 w-16 text-center">
                      {episode.episode_number}
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {episode.title}
                      </h3>
                      {episode.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {episode.description}
                        </p>
                      )}
                      {episode.duration_minutes && (
                        <p className="text-gray-500 text-sm mt-1">
                          {episode.duration_minutes} min
                        </p>
                      )}
                    </div>

                    {/* Play Button */}
                    <button
                      className="bg-flix-red text-white px-6 py-3 rounded hover:bg-red-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayEpisode(episode.id);
                      }}
                    >
                      ▶ Play
                    </button>
                  </div>
                ))}
              </div>
              ) : (
                <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-8 text-center">
                  <p className="text-yellow-400 text-xl mb-3">
                    ⚠️ No episodes found for season {selectedSeason}
                  </p>
                  <p className="text-yellow-300 text-sm mb-4">
                    Possible reasons:
                  </p>
                  <ul className="text-gray-400 text-sm space-y-2 mb-6">
                    <li>• Episodes not synced from Google Drive yet</li>
                    <li>• Season folder is empty on Google Drive</li>
                    <li>• File names not recognized during sync (check server logs)</li>
                    <li>• Google Drive sync may have failed</li>
                  </ul>
                  <button 
                    className="px-6 py-3 bg-flix-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    onClick={() => window.location.href = '/admin'}
                  >
                    Go to Admin Panel to Sync
                  </button>
                  <p className="text-gray-500 text-xs mt-4">
                    Check browser console (F12) for detailed error messages
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl mb-4">No seasons found for this series</p>
              <p className="text-gray-500 text-sm">Try syncing from Google Drive in the Admin Panel</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeriesDetail;

