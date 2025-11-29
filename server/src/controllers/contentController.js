import { supabase, supabaseAdmin } from '../config/supabase.js';
import { transcodeMkvToMp4, isMkvFile } from '../utils/videoTranscode.js';

/**
 * Get series with seasons
 */
export const getSeries = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[getSeries] ===== START =====');
    console.log('[getSeries] Requested series ID:', id);

    const { data, error } = await supabaseAdmin
      .from('content')
      .select('*')
      .eq('id', id)
      .eq('content_type', 'series')
      .single();

    if (error) {
      console.error('[getSeries] Supabase Error:', error);
      throw error;
    }

    if (!data) {
      console.log('[getSeries] No series found with ID:', id);
      return res.status(404).json({ error: 'Series not found' });
    }

    console.log('[getSeries] SUCCESS - Returning series:', data.title);
    res.json(data);
  } catch (error) {
    console.error('[getSeries] Exception:', error);
    next(error);
  }
};

/**
 * Get seasons for a series
 */
export const getSeasons = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error} = await supabaseAdmin
      .from('seasons')
      .select('*')
      .eq('content_id', id)
      .order('season_number', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get episodes for a season
 */
export const getEpisodes = async (req, res, next) => {
  try {
    const { seasonId } = req.params;
    
    console.log('[getEpisodes] Fetching episodes for season ID:', seasonId);

    // Check if season exists
    const { data: season, error: seasonError } = await supabaseAdmin
      .from('seasons')
      .select('id, season_number, content_id, title')
      .eq('id', seasonId)
      .maybeSingle();
    
    if (seasonError) {
      console.error('[getEpisodes] Error fetching season:', seasonError);
      throw seasonError;
    }
    
    if (!season) {
      console.log('[getEpisodes] Season not found:', seasonId);
      return res.status(404).json({ error: 'Season not found' });
    }
    
    console.log('[getEpisodes] Season found:', season);

    // Get episodes
    const { data, error } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('episode_number', { ascending: true });

    if (error) {
      console.error('[getEpisodes] Error fetching episodes:', error);
      throw error;
    }

    console.log(`[getEpisodes] Found ${data.length} episodes`);
    res.json(data);
  } catch (error) {
    console.error('[getEpisodes] Exception:', error);
    next(error);
  }
};

/**
 * Get episode by ID
 */
export const getEpisode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('episodes')
      .select(`
        *,
        seasons!inner(
          season_number,
          content_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Flatten the response
    const episode = {
      ...data,
      season_number: data.seasons.season_number,
      content_id: data.seasons.content_id
    };
    delete episode.seasons;

    res.json(episode);
  } catch (error) {
    next(error);
  }
};

/**
 * Get episode stream URL
 */
export const getEpisodeStreamUrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if test data mode is enabled
    if (testDataLoader.isTestDataMode()) {
      console.log('[getEpisodeStreamUrl] Using test data mode');
      const testEpisode = testDataLoader.getTestEpisode(id);
      if (testEpisode && testEpisode.google_drive_file_id) {
        const streamUrl = `/api/episodes/${id}/stream-video`;
        return res.json({ url: streamUrl, episode: testEpisode });
      } else {
        return res.status(404).json({ error: 'Episode not found' });
      }
    }

    const { data: episode, error } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!episode || !episode.google_drive_file_id) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const streamUrl = `/api/episodes/${id}/stream-video`;

    res.json({ url: streamUrl, episode });
  } catch (error) {
    next(error);
  }
};

/**
 * Stream episode video
 */
export const streamEpisode = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[streamEpisode] Streaming episode ID:', id);

    const { data: episode, error } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !episode) {
      console.log('[streamEpisode] Episode not found');
      return res.status(404).json({ error: 'Episode not found' });
    }

    if (!episode.google_drive_file_id) {
      return res.status(404).json({ error: 'No video file for this episode' });
    }

    // Import dynamically to avoid circular dependency
    const { streamFile, getFileMetadata } = await import('../services/googleDriveService.js');

    // Check if file is MKV and needs transcoding
    let fileMetadata;
    try {
      fileMetadata = await getFileMetadata(episode.google_drive_file_id);
      console.log('[streamEpisode] File metadata:', {
        name: fileMetadata.name,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.size
      });
    } catch (error) {
      console.error('[streamEpisode] Failed to get file metadata:', error);
    }

    const needsTranscoding = isMkvFile(fileMetadata);
    
    if (needsTranscoding) {
      console.log('[streamEpisode] ⚠️ MKV detected - transcoding to MP4 on-the-fly');
      
      try {
        const { stream } = await streamFile(
          episode.google_drive_file_id,
          {} // No range for MKV
        );

        await transcodeMkvToMp4(stream, res);
        return;
      } catch (transcodeError) {
        console.error('[streamEpisode] Transcoding failed:', transcodeError);
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

    // Standard MP4/WebM streaming
    console.log('[streamEpisode] Standard streaming (MP4/WebM)');
    
    const { stream, headers, status } = await streamFile(
      episode.google_drive_file_id,
      { range: req.headers.range }
    );

    res.status(status || 200);
    
    if (headers['content-length']) res.set('Content-Length', headers['content-length']);
    if (headers['content-type']) res.set('Content-Type', headers['content-type'] || 'video/mp4');
    if (headers['content-range']) res.set('Content-Range', headers['content-range']);
    if (headers['accept-ranges']) res.set('Accept-Ranges', headers['accept-ranges'] || 'bytes');

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Range');

    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('[streamEpisode] Stream error:', error);
    });
  } catch (error) {
    console.error('[streamEpisode] Error:', error);
    next(error);
  }
};

/**
 * Stream episode subtitles
 */
export const streamEpisodeSubtitles = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: episode, error } = await supabaseAdmin
      .from('episodes')
      .select('subtitle_file_id')
      .eq('id', id)
      .single();

    if (error || !episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    if (!episode.subtitle_file_id) {
      return res.status(404).json({ error: 'No subtitles available' });
    }

    const { streamFile } = await import('../services/googleDriveService.js');

    const { stream, headers } = await streamFile(
      episode.subtitle_file_id,
      { range: req.headers.range }
    );

    res.set('Content-Type', 'text/vtt');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (headers['content-length']) {
      res.set('Content-Length', headers['content-length']);
    }

    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('[streamEpisodeSubtitles] Stream error:', error);
    });
  } catch (error) {
    console.error('[streamEpisodeSubtitles] Error:', error);
    next(error);
  }
};

export default {
  getSeries,
  getSeasons,
  getEpisodes,
  getEpisode,
  getEpisodeStreamUrl,
  streamEpisode,
  streamEpisodeSubtitles
};
