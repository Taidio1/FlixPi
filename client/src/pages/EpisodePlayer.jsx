import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';

const EpisodePlayer = () => {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEpisodeData = async () => {
      try {
        setLoading(true);
        
        // Get episode details
        const episodeResponse = await api.get(`/episodes/${episodeId}`);
        const episodeData = episodeResponse.data;
        setEpisode(episodeData);

        // Get stream URL
        const streamResponse = await api.get(`/episodes/${episodeId}/stream`);
        setStreamUrl(streamResponse.data.url);
        
        // Get subtitle URL if available
        if (episodeData.subtitle_file_id) {
          const subtitleUrl = `/api/episodes/${episodeId}/stream-subtitles`;
          setSubtitleUrl(subtitleUrl);
          console.log('[EpisodePlayer] Subtitles available:', subtitleUrl);
        } else {
          console.log('[EpisodePlayer] No subtitles for this episode');
        }
      } catch (err) {
        setError('Failed to load episode');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEpisodeData();
  }, [episodeId]);

  const handleClose = () => {
    if (episode && episode.content_id) {
      navigate(`/series/${episode.content_id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading episode...</div>
      </div>
    );
  }

  if (error || !streamUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Episode not available'}</div>
          <button onClick={handleClose} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayer
      movieId={episodeId}
      streamUrl={streamUrl}
      subtitleUrl={subtitleUrl}
      onClose={handleClose}
      isEpisode={true}
    />
  );
};

export default EpisodePlayer;

