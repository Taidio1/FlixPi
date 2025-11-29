import { useEffect, useRef } from 'react';
// Video.js loaded via CDN in index.html
import { progressService } from '../services/progressService';
import { useAuth } from '../contexts/AuthContext';

const VideoPlayer = ({ movieId, streamUrl, subtitleUrl, onClose }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { currentProfile } = useAuth();
  const saveIntervalRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  useEffect(() => {
    // Wait for component to mount
    if (!videoRef.current || !streamUrl) return;

    console.log('[VideoPlayer] Initializing player with URL:', streamUrl);
    console.log('[VideoPlayer] Subtitle URL:', subtitleUrl);

    // Check if videojs is available
    if (typeof window.videojs === 'undefined') {
      console.error('[VideoPlayer] Video.js not loaded!');
      return;
    }

    // Initialize Video.js
    const player = window.videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      inactivityTimeout: 3000, // Hide controls after 3s of inactivity
    });

    // Set video source (backend handles MKV transcoding)
    player.src({
      src: streamUrl,
      type: 'video/mp4'
    });

    // Add subtitles if available
    if (subtitleUrl) {
      console.log('[VideoPlayer] Adding subtitles:', subtitleUrl);
      const track = player.addRemoteTextTrack({
        kind: 'subtitles',
        label: 'Polski',
        srclang: 'pl',
        src: subtitleUrl,
        default: true
      }, false);
      console.log('[VideoPlayer] Subtitle track added:', track);
    } else {
      console.log('[VideoPlayer] No subtitles available');
    }

    // Load saved progress and resume
    if (currentProfile && movieId) {
      progressService.getProgress(movieId, currentProfile.id)
        .then(progress => {
          if (progress && progress.progress_seconds > 5) {
            player.currentTime(progress.progress_seconds);
            console.log('[VideoPlayer] Resumed from:', progress.progress_seconds);
          }
        })
        .catch(err => console.log('No saved progress'));
    }

    // Save progress every 10 seconds while playing
    saveIntervalRef.current = setInterval(() => {
      if (currentProfile && player && !player.paused() && !player.ended()) {
        const currentTime = Math.floor(player.currentTime());
        const duration = Math.floor(player.duration());

        if (currentTime > 0 && duration > 0) {
          progressService.updateProgress(movieId, currentProfile.id, currentTime, duration)
            .catch(err => console.error('Error saving progress:', err));
        }
      }
    }, 10000);

    // Event listeners
    player.on('error', (e) => {
      const error = player.error();
      console.error('[VideoPlayer] Error:', error);
    });

    player.on('loadedmetadata', () => {
      console.log('[VideoPlayer] Video loaded successfully');
    });

    // Auto-hide controls in fullscreen mode
    const showControlsTemporarily = () => {
      if (player.isFullscreen()) {
        // Show controls by removing the hidden class
        player.el().classList.remove('controls-hidden');
        
        // Clear existing timeout
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
        
        // Hide controls after 3 seconds
        hideControlsTimeoutRef.current = setTimeout(() => {
          if (player.isFullscreen()) {
            player.el().classList.add('controls-hidden');
          }
        }, 3000);
      }
    };

    // Show controls on mouse movement in fullscreen
    const handleMouseMove = () => {
      showControlsTemporarily();
    };

    // Spacebar to play/pause
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        
        // Show controls when spacebar is pressed
        if (player.isFullscreen()) {
          showControlsTemporarily();
        }
        
        if (player.paused()) {
          player.play();
        } else {
          player.pause();
        }
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);

    // Handle fullscreen change
    player.on('fullscreenchange', () => {
      if (player.isFullscreen()) {
        console.log('[VideoPlayer] Entered fullscreen mode');
        // Start auto-hide behavior
        showControlsTemporarily();
      } else {
        console.log('[VideoPlayer] Exited fullscreen mode');
        // Ensure controls are visible in normal mode
        player.el().classList.remove('controls-hidden');
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
      }
    });

    playerRef.current = player;

    // Cleanup
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }

      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);

      if (playerRef.current) {
        // Save final progress
        if (currentProfile) {
          const currentTime = Math.floor(playerRef.current.currentTime());
          const duration = Math.floor(playerRef.current.duration());

          if (currentTime > 0 && duration > 0) {
            progressService.updateProgress(movieId, currentProfile.id, currentTime, duration)
              .catch(err => console.error('Error saving final progress:', err));
          }
        }

        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [streamUrl, subtitleUrl, movieId, currentProfile]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video container */}
      <div className="w-full h-full flex items-center justify-center p-4" data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
