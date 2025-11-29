import * as movieService from '../services/movieService.js';
import * as googleDriveService from '../services/googleDriveService.js';
import iconv from 'iconv-lite';
import { transcodeMkvToMp4, isMkvFile } from '../utils/videoTranscode.js';

/**
 * Get all movies
 */
export const getMovies = async (req, res, next) => {
  try {
    const { search, genre } = req.query;

    let movies;

    if (search) {
      movies = await movieService.searchMovies(search);
    } else {
      movies = await movieService.getAllMovies();
    }

    // Filter by genre if provided
    if (genre && movies) {
      movies = movies.filter(movie => 
        movie.genres && movie.genres.includes(genre)
      );
    }

    res.json(movies);
  } catch (error) {
    next(error);
  }
};

/**
 * Get movie by ID
 */
export const getMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getMovieById(id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new movie (admin only)
 */
export const createMovie = async (req, res, next) => {
  try {
    const { title, description, year, duration_minutes, poster_url, google_drive_file_id, subtitle_file_id, genres } = req.body;

    if (!title || !google_drive_file_id) {
      return res.status(400).json({ error: 'Title and Google Drive file ID are required' });
    }

    // Verify Google Drive file exists
    try {
      await googleDriveService.getFileMetadata(google_drive_file_id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Google Drive file ID' });
    }

    const movie = await movieService.createMovie({
      title,
      description,
      year,
      duration_minutes,
      poster_url,
      google_drive_file_id,
      subtitle_file_id,
      genres
    });

    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
};

/**
 * Update movie (admin only)
 */
export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify movie exists
    const existingMovie = await movieService.getMovieById(id);
    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = await movieService.updateMovie(id, updates);

    res.json(movie);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete movie (admin only)
 */
export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify movie exists
    const existingMovie = await movieService.getMovieById(id);
    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    await movieService.deleteMovie(id);

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get streaming URL for movie
 */
export const getStreamUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[getStreamUrl] Requested ID:', id);

    const movie = await movieService.getMovieById(id);
    console.log('[getStreamUrl] Movie found:', movie ? 'YES' : 'NO');
    
    if (!movie) {
      console.log('[getStreamUrl] Movie not found in database');
      return res.status(404).json({ error: 'Movie not found' });
    }

    console.log('[getStreamUrl] Movie:', {
      id: movie.id,
      title: movie.title,
      has_drive_file_id: !!movie.google_drive_file_id,
      drive_file_id: movie.google_drive_file_id
    });

    if (!movie.google_drive_file_id) {
      console.log('[getStreamUrl] No google_drive_file_id');
      return res.status(404).json({ error: 'No video file for this content' });
    }

    // Verify file exists on Google Drive
    try {
      await googleDriveService.verifyFileExists(movie.google_drive_file_id);
      console.log('[getStreamUrl] Google Drive file verified');
    } catch (error) {
      console.error('[getStreamUrl] Google Drive file verification failed:', error);
      return res.status(404).json({ error: 'Video file not found on Google Drive' });
    }

    // Return backend proxy URL with content ID (not Drive file ID!)
    // Use relative URL to avoid CORS issues
    const streamUrl = `/api/movies/${id}/stream-video`;
    console.log('[getStreamUrl] Returning stream URL:', streamUrl);

    res.json({ url: streamUrl, movie });
  } catch (error) {
    console.error('[getStreamUrl] Error:', error);
    next(error);
  }
};

/**
 * Stream movie file with range support
 */
export const streamMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[streamMovie] Streaming content ID:', id);
    console.log('[streamMovie] Range header:', req.headers.range);

    // Get movie/content from database
    const movie = await movieService.getMovieById(id);
    if (!movie) {
      console.log('[streamMovie] Movie not found');
      return res.status(404).json({ error: 'Movie not found' });
    }

    console.log('[streamMovie] Movie found:', {
      id: movie.id,
      title: movie.title,
      drive_file_id: movie.google_drive_file_id
    });

    if (!movie.google_drive_file_id) {
      console.log('[streamMovie] No google_drive_file_id');
      return res.status(404).json({ error: 'No video file associated with this content' });
    }

    // Check if file is MKV and needs transcoding
    let fileMetadata;
    try {
      fileMetadata = await googleDriveService.getFileMetadata(movie.google_drive_file_id);
      console.log('[streamMovie] File metadata:', {
        name: fileMetadata.name,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.size
      });
    } catch (error) {
      console.error('[streamMovie] Failed to get file metadata:', error);
    }

    const needsTranscoding = isMkvFile(fileMetadata);
    
    if (needsTranscoding) {
      console.log('[streamMovie] ⚠️ MKV detected - transcoding to MP4 on-the-fly');
      
      try {
        // For MKV: Get full stream (no range support during transcoding)
        const { stream } = await googleDriveService.streamFile(
          movie.google_drive_file_id,
          {} // No range for MKV (FFmpeg needs full stream)
        );

        // Transcode MKV → MP4 and pipe to response
        await transcodeMkvToMp4(stream, res);
        return; // Exit after transcoding
      } catch (transcodeError) {
        console.error('[streamMovie] Transcoding failed:', transcodeError);
        if (!res.headersSent) {
          return res.status(500).json({ 
            error: 'MKV transcoding failed',
            details: transcodeError.message,
            hint: 'Make sure FFmpeg is installed on the server'
          });
        }
        return;
      }
    }

    // Standard MP4/WebM streaming (with range support)
    console.log('[streamMovie] Standard streaming (MP4/WebM)');
    
    try {
      const { stream, headers, status } = await googleDriveService.streamFile(
        movie.google_drive_file_id,
        { range: req.headers.range }
      );

      // Set response headers
      res.status(status || 200);
      
      if (headers['content-length']) {
        res.set('Content-Length', headers['content-length']);
      }
      if (headers['content-type']) {
        res.set('Content-Type', headers['content-type'] || 'video/mp4');
      }
      if (headers['content-range']) {
        res.set('Content-Range', headers['content-range']);
      }
      if (headers['accept-ranges']) {
        res.set('Accept-Ranges', headers['accept-ranges'] || 'bytes');
      }

      // CORS headers for streaming
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Range');

      // Pipe stream to response
      stream.pipe(res);
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Streaming failed' });
        }
      });
    } catch (driveError) {
      console.error('Google Drive streaming error:', driveError);
      return res.status(500).json({ 
        error: 'Failed to stream from Google Drive',
        details: driveError.message 
      });
    }
  } catch (error) {
    console.error('Stream movie error:', error);
    next(error);
  }
};

/**
 * Get subtitles for movie
 */
export const getSubtitles = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[getSubtitles] Request for movie ID:', id);

    const movie = await movieService.getMovieById(id);
    console.log('[getSubtitles] Movie found:', movie ? 'YES' : 'NO');
    console.log('[getSubtitles] subtitle_file_id:', movie?.subtitle_file_id || 'NONE');
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (!movie.subtitle_file_id) {
      console.log('[getSubtitles] No subtitle_file_id for this movie');
      return res.status(404).json({ error: 'No subtitles available for this movie' });
    }

    // Return backend proxy URL for subtitles (similar to video streaming)
    const subtitleUrl = `/api/movies/${id}/stream-subtitles`;
    console.log('[getSubtitles] Returning subtitle URL:', subtitleUrl);

    res.json({ url: subtitleUrl });
  } catch (error) {
    console.error('[getSubtitles] Error:', error);
    next(error);
  }
};

/**
 * Convert SRT to WebVTT format
 */
const srtToVtt = (srt) => {
  // Add WebVTT header
  let vtt = 'WEBVTT\n\n';
  
  // Replace comma with dot in timestamps (00:00:00,000 -> 00:00:00.000)
  vtt += srt.replace(/,(\d{3})/g, '.$1');
  
  return vtt;
};

/**
 * Stream subtitle file from Google Drive
 */
export const streamSubtitles = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[streamSubtitles] Streaming subtitles for content ID:', id);

    const movie = await movieService.getMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (!movie.subtitle_file_id) {
      return res.status(404).json({ error: 'No subtitles available' });
    }

    try {
      const { stream, headers } = await googleDriveService.streamFile(
        movie.subtitle_file_id,
        {}
      );

      // Collect SRT content as Buffer to preserve encoding
      const chunks = [];
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        console.log('[streamSubtitles] Converting SRT to WebVTT');
        
        // Combine chunks
        const buffer = Buffer.concat(chunks);
        
        // Try to detect encoding - check for Polish characters
        let srtContent;
        
        // First try UTF-8
        const utf8Content = buffer.toString('utf-8');
        
        // Check if UTF-8 decoding has invalid characters (�)
        if (utf8Content.includes('�') || utf8Content.includes('\ufffd')) {
          console.log('[streamSubtitles] UTF-8 failed, trying Windows-1250 (Polish)');
          // Decode from Windows-1250 (common for Polish SRT files)
          srtContent = iconv.decode(buffer, 'windows-1250');
        } else {
          console.log('[streamSubtitles] Using UTF-8 encoding');
          srtContent = utf8Content;
        }
        
        // Convert SRT to VTT
        const vttContent = srtToVtt(srtContent);
        
        // Set WebVTT headers with explicit UTF-8
        res.set('Content-Type', 'text/vtt; charset=utf-8');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        
        // Send VTT content as UTF-8 Buffer
        res.send(Buffer.from(vttContent, 'utf-8'));
      });

      stream.on('error', (error) => {
        console.error('Subtitle stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Subtitle streaming failed' });
        }
      });
    } catch (driveError) {
      console.error('Google Drive subtitle streaming error:', driveError);
      return res.status(500).json({ 
        error: 'Failed to stream subtitles from Google Drive',
        details: driveError.message 
      });
    }
  } catch (error) {
    console.error('Stream subtitles error:', error);
    next(error);
  }
};

export default {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getStreamUrl,
  streamMovie,
  getSubtitles,
  streamSubtitles
};

