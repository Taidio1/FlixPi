import { spawn } from 'child_process';
import { PassThrough } from 'stream';

/**
 * Transcode MKV to MP4 on-the-fly using FFmpeg
 * @param {Stream} inputStream - Input video stream (MKV)
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const transcodeMkvToMp4 = (inputStream, res) => {
  return new Promise((resolve, reject) => {
    console.log('[FFmpeg] Starting MKV → MP4 transcoding...');

    // FFmpeg command for fast transcoding:
    // -i pipe:0 = read from stdin
    // -c:v copy = copy video codec (no re-encoding if H.264)
    // -c:a aac = transcode audio to AAC (browser-compatible)
    // -movflags frag_keyframe+empty_moov = enable streaming
    // -f mp4 = output format MP4
    // pipe:1 = write to stdout
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',           // Input from stdin
      '-c:v', 'copy',           // Copy video stream (fast, no re-encode)
      '-c:a', 'aac',            // Transcode audio to AAC
      '-b:a', '128k',           // Audio bitrate
      '-movflags', 'frag_keyframe+empty_moov', // Enable HTTP streaming
      '-f', 'mp4',              // Output format
      'pipe:1'                  // Output to stdout
    ]);

    // Pipe input stream to FFmpeg stdin
    inputStream.pipe(ffmpeg.stdin);

    // Set response headers for MP4 streaming
    res.set('Content-Type', 'video/mp4');
    res.set('Accept-Ranges', 'bytes');
    res.set('Access-Control-Allow-Origin', '*');

    // Pipe FFmpeg stdout to response
    ffmpeg.stdout.pipe(res);

    // Handle FFmpeg errors
    ffmpeg.stderr.on('data', (data) => {
      // FFmpeg outputs progress to stderr (not an error)
      console.log(`[FFmpeg] ${data.toString().trim()}`);
    });

    ffmpeg.on('error', (error) => {
      console.error('[FFmpeg] Process error:', error);
      reject(error);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('[FFmpeg] Transcoding completed successfully');
        resolve();
      } else {
        console.error(`[FFmpeg] Process exited with code ${code}`);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    // Handle response close (user stopped playback)
    res.on('close', () => {
      console.log('[FFmpeg] Client disconnected, stopping transcoding');
      ffmpeg.kill('SIGKILL');
    });

    // Handle input stream errors
    inputStream.on('error', (error) => {
      console.error('[FFmpeg] Input stream error:', error);
      ffmpeg.kill('SIGKILL');
      reject(error);
    });
  });
};

/**
 * Check if file is MKV based on metadata
 * @param {object} fileMetadata - Google Drive file metadata
 * @returns {boolean}
 */
export const isMkvFile = (fileMetadata) => {
  if (!fileMetadata) return false;
  
  const mimeType = fileMetadata.mimeType?.toLowerCase() || '';
  const fileName = fileMetadata.name?.toLowerCase() || '';
  
  return (
    mimeType === 'video/x-matroska' ||
    mimeType === 'video/mkv' ||
    fileName.endsWith('.mkv')
  );
};

/**
 * Check if FFmpeg is available on system
 * @returns {Promise<boolean>}
 */
export const checkFfmpegAvailable = () => {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('error', () => {
      console.error('[FFmpeg] FFmpeg not found on system!');
      resolve(false);
    });
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
  });
};

export default {
  transcodeMkvToMp4,
  isMkvFile,
  checkFfmpegAvailable
};
