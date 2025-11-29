import { drive } from '../config/googleDrive.js';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Scan Google Drive folder and sync movies/series to database
 */

/**
 * List all files and folders in a Drive folder
 */
const listFolderContents = async (folderId) => {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime)',
      orderBy: 'name'
    });
    
    return response.data.files || [];
  } catch (error) {
    console.error('Error listing folder contents:', error);
    throw error;
  }
};

/**
 * Check if file is a video based on mimeType or filename
 */
const isVideoFile = (filename, mimeType = null) => {
  // Check mimeType first (more reliable for Google Drive)
  if (mimeType) {
    const videoMimeTypes = [
      'video/mp4',
      'video/x-matroska', // mkv
      'video/avi',
      'video/x-msvideo', // avi
      'video/quicktime', // mov
      'video/x-ms-wmv', // wmv
      'video/x-flv', // flv
      'video/webm',
      'video/x-m4v' // m4v
    ];
    
    if (videoMimeTypes.includes(mimeType)) {
      return true;
    }
  }
  
  // Fallback: check filename extension
  const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

/**
 * Check if file is a subtitle file (.vtt, .srt)
 */
const isSubtitleFile = (filename) => {
  const subtitleExtensions = ['.vtt', '.srt'];
  return subtitleExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

/**
 * Get filename without extension
 */
const getFilenameWithoutExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, '');
};

/**
 * Find matching subtitle file for a video file
 * Matches by exact filename (without extension)
 * Example: S02E01.mp4 matches S02E01.vtt
 */
const findMatchingSubtitle = (videoFilename, allFiles) => {
  const videoNameWithoutExt = getFilenameWithoutExtension(videoFilename);
  
  const matchingSubtitle = allFiles.find(file => {
    if (!isSubtitleFile(file.name)) return false;
    
    const subtitleNameWithoutExt = getFilenameWithoutExtension(file.name);
    return subtitleNameWithoutExt === videoNameWithoutExt;
  });
  
  if (matchingSubtitle) {
    console.log(`    ✅ [SUBTITLE MATCH] Found subtitle: ${matchingSubtitle.name} for ${videoFilename}`);
  }
  
  return matchingSubtitle;
};

/**
 * Parse movie filename to extract metadata
 * Example: "Movie Title (2023).mp4" -> { title: "Movie Title", year: 2023 }
 * Example: "A.Haunted.House.2.mp4" -> { title: "A Haunted House 2", year: null }
 */
const parseMovieFilename = (filename) => {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Try to extract year
  const yearMatch = nameWithoutExt.match(/\((\d{4})\)/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  
  // Remove year from title
  let title = nameWithoutExt;
  if (yearMatch) {
    title = title.replace(/\s*\(\d{4}\)\s*/, '').trim();
  }
  
  // ✅ NORMALIZE FILENAME: Replace dots and underscores with spaces
  // This handles filenames like: "A.Haunted.House.2.mp4" -> "A Haunted House 2"
  title = title
    .replace(/\./g, ' ')        // Replace dots with spaces
    .replace(/_/g, ' ')         // Replace underscores with spaces
    .replace(/\s+/g, ' ')       // Normalize multiple spaces to single space
    .trim();                    // Remove leading/trailing spaces
  
  // Clean up release info (quality, source, codec)
  title = title
    .replace(/\b(720p|1080p|2160p|4K|HD|UHD)\b/gi, '')  // Remove quality
    .replace(/\b(WEB-?DL|WEBRip|BluRay|BRRip|HDTV|DVDRip)\b/gi, '')  // Remove source
    .replace(/\b(x264|x265|h\.?264|h\.?265|HEVC|AAC|AC3)\b/gi, '')  // Remove codec
    .replace(/\[.*?\]/g, '')     // Remove content in brackets []
    .replace(/\(.*?\)/g, '')     // Remove content in parentheses () (except year, already handled)
    .replace(/\s+/g, ' ')        // Normalize spaces again
    .trim();
  
  return { title, year };
};

/**
 * Parse episode filename
 * Supports multiple formats:
 * - S01E01 or s01e01
 * - 1x01
 * - Series.S01E01
 * - Peacemaker 2022 720p (extracts from season folder context)
 */
const parseEpisodeFilename = (filename, seasonNumber = null) => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Try standard formats: S01E01, s01e01, 1x01
  let episodeMatch = nameWithoutExt.match(/[Ss](\d{1,2})[Ee](\d{1,2})|(\d{1,2})x(\d{1,2})/);
  
  if (episodeMatch) {
    const season = parseInt(episodeMatch[1] || episodeMatch[3]);
    const episode = parseInt(episodeMatch[2] || episodeMatch[4]);
    
    // Extract title (everything after episode number)
    let title = nameWithoutExt
      .replace(/[Ss]\d{1,2}[Ee]\d{1,2}|\d{1,2}x\d{1,2}/, '')
      .replace(/^[\s-]+/, '')
      .replace(/[\s-]+$/, '')
      .trim();
    
    if (!title) {
      title = `Episode ${episode}`;
    }
    
    return { season, episode, title };
  }
  
  // Alternative: Try to extract episode number from standalone digits
  // Example: "Peacemaker 2022 03.mp4" or "Episode 03.mp4" or "- E07 -"
  let standaloneEpisodeMatch = nameWithoutExt.match(/(?:Episode|Ep)\s+(\d{1,2})(?:[^\d]|$)/i);
  
  // Try pattern with dashes/spaces: "- E07 -", " E07 ", "- E07", "E07 -", etc.
  // More flexible - obsługuje różne kombinacje spacji i myślników
  if (!standaloneEpisodeMatch && seasonNumber) {
    standaloneEpisodeMatch = nameWithoutExt.match(/[\s-]*[Ee](\d{1,2})[\s-]/i);
  }
  
  // Jeśli nadal nic - spróbuj szukać E + cyfry bez wymagania otoczenia
  if (!standaloneEpisodeMatch && seasonNumber) {
    standaloneEpisodeMatch = nameWithoutExt.match(/\bE(\d{1,2})\b/i);
  }
  
  if (standaloneEpisodeMatch && seasonNumber) {
    const episode = parseInt(standaloneEpisodeMatch[1]);
    let title = nameWithoutExt
      .replace(/(?:Episode|Ep|E)\s+\d{1,2}/i, '')
      .replace(/\d{4}/, '') // Remove year
      .replace(/720p|1080p|2160p|4K/gi, '') // Remove quality
      .replace(/WEB|BluRay|HDTV|DVDRip/gi, '') // Remove source
      .replace(/H\.?264|x264|H\.?265|x265|HEVC/gi, '') // Remove codec
      .replace(/\[.*?\]/g, '') // Remove brackets content
      .replace(/[\s-]+/g, ' ') // Normalize spaces
      .trim();
    
    if (!title) {
      title = `Episode ${episode}`;
    }
    
    return { season: seasonNumber, episode, title };
  }
  
  // Last resort: If filename is just a number (01.mp4, 02.mp4) and we have season context
  const simpleNumberMatch = nameWithoutExt.match(/^(\d{1,2})$/);
  if (simpleNumberMatch && seasonNumber) {
    const episode = parseInt(simpleNumberMatch[1]);
    return { season: seasonNumber, episode, title: `Episode ${episode}` };
  }
  
  console.log(`⚠️ Could not parse episode from filename: ${filename}`);
  return null;
};

/**
 * Sync movies from Google Drive folder
 */
export const syncMoviesFromDrive = async (moviesFolderId) => {
  let itemsFound = 0;
  let itemsAdded = 0;
  let itemsUpdated = 0;
  
  try {
    console.log('Starting movies sync from folder:', moviesFolderId);
    
    const files = await listFolderContents(moviesFolderId);
    const videoFiles = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder' && isVideoFile(f.name, f.mimeType));
    
    itemsFound = videoFiles.length;
    console.log(`Found ${itemsFound} video files`);
    
    for (const file of videoFiles) {
      const { title, year } = parseMovieFilename(file.name);
      
      // Check if movie already exists by drive file ID
      const { data: existing } = await supabaseAdmin
        .from('content')
        .select('id')
        .eq('google_drive_file_id', file.id)
        .eq('content_type', 'movie')
        .single();
      
      const movieData = {
        title,
        year,
        google_drive_file_id: file.id,
        content_type: 'movie'
      };
      
      if (existing) {
        // Update existing movie
        await supabaseAdmin
          .from('content')
          .update(movieData)
          .eq('id', existing.id);
        
        itemsUpdated++;
        console.log(`Updated movie: ${title}`);
      } else {
        // Insert new movie
        await supabaseAdmin
          .from('content')
          .insert([movieData]);
        
        itemsAdded++;
        console.log(`Added movie: ${title}`);
      }
    }
    
    // Log sync
    await supabaseAdmin
      .from('drive_sync_log')
      .insert([{
        folder_id: moviesFolderId,
        sync_type: 'movies',
        items_found: itemsFound,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        status: 'success'
      }]);
    
    return {
      success: true,
      itemsFound,
      itemsAdded,
      itemsUpdated
    };
    
  } catch (error) {
    console.error('Error syncing movies:', error);
    
    // Log failed sync
    await supabaseAdmin
      .from('drive_sync_log')
      .insert([{
        folder_id: moviesFolderId,
        sync_type: 'movies',
        items_found: itemsFound,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        status: 'failed',
        error_message: error.message
      }]);
    
    throw error;
  }
};

/**
 * Sync series from Google Drive folder
 * Expected structure:
 * Series Folder/
 *   Series Name/
 *     Season 1/
 *       S01E01.mp4
 *       S01E02.mp4
 *     Season 2/
 *       S02E01.mp4
 */
export const syncSeriesFromDrive = async (seriesFolderId) => {
  let itemsFound = 0;
  let itemsAdded = 0;
  let itemsUpdated = 0;
  
  try {
    console.log('=== Starting series sync ===');
    console.log('Series folder ID:', seriesFolderId);
    
    // Get all series folders
    const seriesFolders = await listFolderContents(seriesFolderId);
    console.log('All items in series folder:', seriesFolders.length);
    console.log('Items:', seriesFolders.map(f => ({ name: f.name, type: f.mimeType })));
    
    const seriesOnly = seriesFolders.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    
    console.log(`Found ${seriesOnly.length} series folders:`, seriesOnly.map(f => f.name));
    
    for (const seriesFolder of seriesOnly) {
      const seriesTitle = seriesFolder.name;
      const seriesFolderId = seriesFolder.id;  // ✅ Store folder ID for deduplication
      console.log(`\n--- Processing series: ${seriesTitle} (Folder ID: ${seriesFolderId}) ---`);
      
      // Get or create series content - check by folder ID first, then by title
      let { data: seriesContent } = await supabaseAdmin
        .from('content')
        .select('id, title, google_drive_file_id')
        .eq('google_drive_file_id', seriesFolderId)  // ✅ PRIMARY CHECK: by folder ID
        .eq('content_type', 'series')
        .maybeSingle();
      
      // Fallback: Check by title if folder ID not found (for legacy data)
      if (!seriesContent) {
        console.log(`  No series found by folder ID, checking by title: "${seriesTitle}"`);
        const { data: seriesByTitle } = await supabaseAdmin
          .from('content')
          .select('id, title, google_drive_file_id')
          .eq('title', seriesTitle)
          .eq('content_type', 'series')
          .is('google_drive_file_id', null)  // Only legacy entries without folder ID
          .maybeSingle();
        
        if (seriesByTitle) {
          console.log(`  Found legacy series by title, updating with folder ID`);
          // Update legacy entry with folder ID
          const { data: updated } = await supabaseAdmin
            .from('content')
            .update({ google_drive_file_id: seriesFolderId })
            .eq('id', seriesByTitle.id)
            .select()
            .single();
          
          seriesContent = updated;
        }
      }
      
      if (!seriesContent) {
        const { data: newSeries } = await supabaseAdmin
          .from('content')
          .insert([{
            title: seriesTitle,
            content_type: 'series',
            google_drive_file_id: seriesFolderId  // ✅ Store folder ID for deduplication
          }])
          .select()
          .single();
        
        seriesContent = newSeries;
        console.log(`✅ Created NEW series: ${seriesTitle} (Folder ID: ${seriesFolderId})`);
      } else {
        console.log(`♻️  Found EXISTING series: ${seriesTitle} (ID: ${seriesContent.id})`);
      }
      
      // Get season folders
      const seasonFolders = await listFolderContents(seriesFolder.id);
      console.log(`  Season folders found: ${seasonFolders.length}`);
      console.log('  All items:', seasonFolders.map(f => ({ name: f.name, type: f.mimeType })));
      
      const seasonsOnly = seasonFolders.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
      console.log(`  Season folders (filtered): ${seasonsOnly.length}`, seasonsOnly.map(f => f.name));
      
      for (const seasonFolder of seasonsOnly) {
        console.log(`\n  --- Processing season folder: ${seasonFolder.name} ---`);
        
        // Extract season number from folder name (English: Season, Polish: Sezon)
        const seasonMatch = seasonFolder.name.match(/[Ss]e(ason|zon)\s*(\d+)|[Ss](\d+)/i);
        if (!seasonMatch) {
          console.log(`  ⚠️ Could not parse season number from: ${seasonFolder.name}`);
          continue;
        }
        
        // Match groups: [1]=ason/zon, [2]=number from Season/Sezon, [3]=number from S1
        const seasonNumber = parseInt(seasonMatch[2] || seasonMatch[3]);
        console.log(`  Season number parsed: ${seasonNumber}`);
        
        // Get or create season
        let { data: season } = await supabaseAdmin
          .from('seasons')
          .select('id')
          .eq('content_id', seriesContent.id)
          .eq('season_number', seasonNumber)
          .maybeSingle();
        
        if (!season) {
          const { data: newSeason } = await supabaseAdmin
            .from('seasons')
            .insert([{
              content_id: seriesContent.id,
              season_number: seasonNumber,
              title: `Season ${seasonNumber}`
            }])
            .select()
            .single();
          
          season = newSeason;
          console.log(`Created season ${seasonNumber} for ${seriesTitle}`);
        }
        
        // Get episode files
        const episodeFiles = await listFolderContents(seasonFolder.id);
        console.log(`    Episode files in folder: ${episodeFiles.length}`);
        console.log('    All files:', episodeFiles.map(f => ({ name: f.name, type: f.mimeType })));
        
        const videoEpisodes = episodeFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder' && isVideoFile(f.name, f.mimeType));
        console.log(`    Video episodes (filtered): ${videoEpisodes.length}`, videoEpisodes.map(f => f.name));
        
        // Filter subtitle files
        const subtitleFiles = episodeFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder' && isSubtitleFile(f.name));
        console.log(`    Subtitle files found: ${subtitleFiles.length}`, subtitleFiles.map(f => f.name));
        
        itemsFound += videoEpisodes.length;
        
        for (let i = 0; i < videoEpisodes.length; i++) {
          const episodeFile = videoEpisodes[i];
          console.log(`\n    ==== Parsing episode file [${i + 1}/${videoEpisodes.length}]: ${episodeFile.name} ====`);
          
          const nameWithoutExt = episodeFile.name.replace(/\.[^/.]+$/, '');
          console.log(`    [DEBUG] Filename without ext: "${nameWithoutExt}"`);
          console.log(`    [DEBUG] Season number context: ${seasonNumber}`);
          
          let episodeInfo = parseEpisodeFilename(episodeFile.name, seasonNumber);
          
          if (episodeInfo) {
            console.log(`    ✅ [SUCCESS] Parsed: S${episodeInfo.season}E${episodeInfo.episode} - "${episodeInfo.title}"`);
          } else {
            console.log(`    ❌ [FAILED] Could not parse episode info from regex patterns`);
          }
          
          // Fallback: If no episode number found, use index + 1
          if (!episodeInfo && seasonNumber) {
            const fallbackEpisodeNumber = i + 1;
            console.log(`    ⚠️  [FALLBACK] Using episode number: ${fallbackEpisodeNumber} (based on file order)`);
            console.log(`    [INFO] Original filename will be cleaned for title`);
            
            // Clean up filename for title
            let title = episodeFile.name
              .replace(/\.[^/.]+$/, '') // Remove extension
              .replace(/\d{4}/, '') // Remove year
              .replace(/720p|1080p|2160p|4K/gi, '') // Remove quality
              .replace(/WEB|BluRay|HDTV|DVDRip/gi, '') // Remove source
              .replace(/H\.?264|x264|H\.?265|x265|HEVC/gi, '') // Remove codec
              .replace(/\[.*?\]/g, '') // Remove brackets
              .replace(/[\s-]+/g, ' ') // Normalize spaces
              .trim();
            
            if (!title) {
              title = `Episode ${fallbackEpisodeNumber}`;
            }
            
            episodeInfo = {
              season: seasonNumber,
              episode: fallbackEpisodeNumber,
              title
            };
            console.log(`    ✅ [FALLBACK SUCCESS] Created: S${seasonNumber}E${fallbackEpisodeNumber} - "${title}"`);
          }
          
          if (!episodeInfo) {
            console.log(`    ❌ [ERROR] Could not parse episode info from: ${episodeFile.name}`);
            console.log(`    [ERROR] Skipping this file...`);
            continue;
          }
          
          console.log(`    💾 [SAVING] Episode: S${episodeInfo.season}E${episodeInfo.episode} - ${episodeInfo.title}`);
          console.log(`    [INFO] Drive File ID: ${episodeFile.id}`);
          
          // Check if episode exists
          const { data: existing, error: existingError } = await supabaseAdmin
            .from('episodes')
            .select('id')
            .eq('google_drive_file_id', episodeFile.id)
            .maybeSingle();
          
          if (existingError && existingError.code !== 'PGRST116') {
            // PGRST116 = no rows found (to OK)
            console.error(`    [ERROR] Error checking existing episode:`, existingError);
            throw existingError;
          }
          
          // Find matching subtitle file
          const matchingSubtitle = findMatchingSubtitle(episodeFile.name, subtitleFiles);
          
          const episodeData = {
            season_id: season.id,
            episode_number: episodeInfo.episode,
            title: episodeInfo.title,
            google_drive_file_id: episodeFile.id,
            subtitle_file_id: matchingSubtitle ? matchingSubtitle.id : null
          };
          
          if (matchingSubtitle) {
            console.log(`    📝 [SUBTITLE] Attaching subtitle file ID: ${matchingSubtitle.id}`);
          }
          
          if (existing) {
            await supabaseAdmin
              .from('episodes')
              .update(episodeData)
              .eq('id', existing.id);
            
            itemsUpdated++;
            console.log(`    ♻️  [UPDATED] Episode ID: ${existing.id}`);
          } else {
            const { data: newEpisode, error: insertError } = await supabaseAdmin
              .from('episodes')
              .insert([episodeData])
              .select()
              .single();
            
            if (insertError) {
              console.error(`    ❌ [ERROR] Failed to insert episode:`, insertError);
              throw insertError;
            }
            
            itemsAdded++;
            console.log(`    ✅ [CREATED] New episode ID: ${newEpisode.id}`);
          }
          
          console.log(`    ✓ Processed ${seriesTitle} S${seasonNumber}E${episodeInfo.episode} successfully\n`);
        }
      }
      
      // Update series totals - FIXED: proper counting
      // First get all season IDs for this series
      const { data: seasons } = await supabaseAdmin
        .from('seasons')
        .select('id')
        .eq('content_id', seriesContent.id);
      
      const seasonIds = seasons ? seasons.map(s => s.id) : [];
      const totalSeasons = seasonIds.length;
      
      // Count episodes across all seasons
      let totalEpisodes = 0;
      if (seasonIds.length > 0) {
        const { count } = await supabaseAdmin
          .from('episodes')
          .select('id', { count: 'exact', head: true })
          .in('season_id', seasonIds);
        
        totalEpisodes = count || 0;
      }
      
      console.log(`\n📊 Updating series totals for "${seriesTitle}":`);
      console.log(`   Seasons: ${totalSeasons}, Episodes: ${totalEpisodes}`);
      
      await supabaseAdmin
        .from('content')
        .update({
          total_seasons: totalSeasons,
          total_episodes: totalEpisodes
        })
        .eq('id', seriesContent.id);
    }
    
    // Log sync
    await supabaseAdmin
      .from('drive_sync_log')
      .insert([{
        folder_id: seriesFolderId,
        sync_type: 'series',
        items_found: itemsFound,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        status: 'success'
      }]);
    
    return {
      success: true,
      itemsFound,
      itemsAdded,
      itemsUpdated
    };
    
  } catch (error) {
    console.error('Error syncing series:', error);
    
    await supabaseAdmin
      .from('drive_sync_log')
      .insert([{
        folder_id: seriesFolderId,
        sync_type: 'series',
        items_found: itemsFound,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        status: 'failed',
        error_message: error.message
      }]);
    
    throw error;
  }
};

export default {
  syncMoviesFromDrive,
  syncSeriesFromDrive
};

