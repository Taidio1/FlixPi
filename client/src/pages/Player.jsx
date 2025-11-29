import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import VideoPlayer from '../components/VideoPlayer';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [streamUrl, setStreamUrl] = useState(null);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStreamData = async () => {
      try {
        setLoading(true);
        
        console.log('[Player] Loading stream data for movie ID:', id);
        
        // Get streaming URL
        const streamData = await movieService.getStreamUrl(id);
        console.log('[Player] Stream data received:', streamData);
        console.log('[Player] Stream URL:', streamData.url);
        
        setStreamUrl(streamData.url);

        // Get subtitles if available
        try {
          console.log('[Player] Fetching subtitles for movie:', id);
          const subtitleData = await movieService.getSubtitles(id);
          console.log('[Player] Subtitle data received:', subtitleData);
          if (subtitleData && subtitleData.url) {
            console.log('[Player] Setting subtitle URL:', subtitleData.url);
            setSubtitleUrl(subtitleData.url);
          } else {
            console.log('[Player] No subtitle URL in response');
          }
        } catch (err) {
          // No subtitles available - that's okay
          console.log('[Player] Error fetching subtitles:', err);
        }
      } catch (err) {
        setError('Failed to load video');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStreamData();
  }, [id]);

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (error || !streamUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Video not available'}</div>
          <button onClick={handleClose} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayer
      movieId={id}
      streamUrl={streamUrl}
      subtitleUrl={subtitleUrl}
      onClose={handleClose}
    />
  );
};

export default Player;

