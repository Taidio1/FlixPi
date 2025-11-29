import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let testData = null;

/**
 * Load test data from JSON file
 */
export const loadTestData = () => {
  if (testData) {
    return testData;
  }

  try {
    const testDataPath = path.join(__dirname, '../data/test-data.json');
    const rawData = fs.readFileSync(testDataPath, 'utf8');
    testData = JSON.parse(rawData);
    console.log('[TestDataLoader] Loaded test data with', testData.content.length, 'items');
    return testData;
  } catch (error) {
    console.error('[TestDataLoader] Error loading test data:', error);
    return null;
  }
};

/**
 * Check if test data mode is enabled
 */
export const isTestDataMode = () => {
  return process.env.USE_TEST_DATA === 'true' || process.env.NODE_ENV === 'test';
};

/**
 * Get all content from test data
 */
export const getTestContent = () => {
  if (!isTestDataMode()) return null;
  const data = loadTestData();
  return data?.content || [];
};

/**
 * Get content by ID from test data
 */
export const getTestContentById = (id) => {
  if (!isTestDataMode()) return null;
  const data = loadTestData();
  return data?.content.find(item => item.id === id) || null;
};

/**
 * Get seasons for series from test data
 */
export const getTestSeasons = (contentId) => {
  if (!isTestDataMode()) return null;
  const data = loadTestData();
  return data?.seasons.filter(season => season.content_id === contentId) || [];
};

/**
 * Get episodes for season from test data
 */
export const getTestEpisodes = (seasonId) => {
  if (!isTestDataMode()) return null;
  const data = loadTestData();
  return data?.episodes.filter(episode => episode.season_id === seasonId) || [];
};

/**
 * Get episode by ID from test data
 */
export const getTestEpisode = (episodeId) => {
  if (!isTestDataMode()) return null;
  const data = loadTestData();
  const episode = data?.episodes.find(ep => ep.id === episodeId);
  
  if (!episode) return null;
  
  // Add season info
  const season = data?.seasons.find(s => s.id === episode.season_id);
  return {
    ...episode,
    seasons: season ? {
      season_number: season.season_number,
      content_id: season.content_id
    } : null
  };
};

export default {
  loadTestData,
  isTestDataMode,
  getTestContent,
  getTestContentById,
  getTestSeasons,
  getTestEpisodes,
  getTestEpisode
};

