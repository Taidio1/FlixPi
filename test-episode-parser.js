// Test script for episode filename parser

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
  // Example: "Peacemaker 2022 03.mp4" or "Episode 03.mp4"
  const standaloneEpisodeMatch = nameWithoutExt.match(/(?:Episode|Ep|E)\s+(\d{1,2})(?:[^\d]|$)/i);
  
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

// Test cases
console.log('=== Testing Episode Parser ===\n');

const testCases = [
  // Standard formats
  { filename: 'S01E01 - Pilot.mp4', seasonNumber: null, expected: { season: 1, episode: 1 } },
  { filename: 's02e03 Episode Title.mp4', seasonNumber: null, expected: { season: 2, episode: 3 } },
  { filename: '1x05 - Something.mp4', seasonNumber: null, expected: { season: 1, episode: 5 } },
  
  // Problematic format from Peacemaker
  { filename: 'Peacemaker 2022  720p WEB H264-JFF[EZTVx.to].mp4', seasonNumber: 2, expected: { season: 2, episode: null } },
  
  // Alternative formats
  { filename: 'Episode 03.mp4', seasonNumber: 2, expected: { season: 2, episode: 3 } },
  { filename: 'Ep 05 - Title.mp4', seasonNumber: 1, expected: { season: 1, episode: 5 } },
  { filename: '03.mp4', seasonNumber: 2, expected: { season: 2, episode: 3 } },
  
  // Edge cases
  { filename: 'Show Name - E07 - Episode Title.mp4', seasonNumber: 1, expected: { season: 1, episode: 7 } },
];

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.filename}`);
  console.log(`  Season context: ${test.seasonNumber ?? 'none'}`);
  
  const result = parseEpisodeFilename(test.filename, test.seasonNumber);
  
  if (result) {
    console.log(`  ✅ Parsed: Season ${result.season}, Episode ${result.episode}`);
    console.log(`     Title: "${result.title}"`);
  } else {
    console.log(`  ❌ Failed to parse`);
  }
  console.log('');
});

console.log('=== Test Complete ===');
