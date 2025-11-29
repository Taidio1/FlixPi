-- ============================================
-- SEED DATA FOR TESTING
-- ============================================
-- This file contains sample data for testing FlixPi
-- Run this AFTER the main migration (001_initial_schema.sql)

-- Note: Replace 'YOUR_GOOGLE_DRIVE_FILE_ID' with actual file IDs
-- from your Google Drive

-- ============================================
-- SAMPLE MOVIES
-- ============================================

INSERT INTO movies (
  title, 
  description, 
  year, 
  duration_minutes, 
  poster_url, 
  google_drive_file_id, 
  subtitle_file_id,
  genres
) VALUES 
(
  'Sample Action Movie',
  'An action-packed thriller with amazing stunts and visual effects. Follow the hero as they save the world from impending doom.',
  2023,
  142,
  'https://via.placeholder.com/300x450/E50914/FFFFFF?text=Action+Movie',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_1',
  NULL,
  ARRAY['Action', 'Thriller', 'Adventure']
),
(
  'Comedy Classic',
  'A hilarious comedy that will keep you laughing from start to finish. Perfect for a fun movie night with friends.',
  2022,
  98,
  'https://via.placeholder.com/300x450/0080FF/FFFFFF?text=Comedy+Classic',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_2',
  NULL,
  ARRAY['Comedy', 'Romance']
),
(
  'Sci-Fi Epic',
  'A mind-bending science fiction adventure set in a dystopian future. Stunning visuals and thought-provoking story.',
  2024,
  156,
  'https://via.placeholder.com/300x450/00FF00/000000?text=Sci-Fi+Epic',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_3',
  NULL,
  ARRAY['Sci-Fi', 'Drama', 'Thriller']
),
(
  'Horror Night',
  'A terrifying horror film that will keep you on the edge of your seat. Not for the faint of heart!',
  2023,
  104,
  'https://via.placeholder.com/300x450/FF0000/FFFFFF?text=Horror+Night',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_4',
  NULL,
  ARRAY['Horror', 'Thriller']
),
(
  'Romantic Drama',
  'A beautiful love story that spans across decades. Emotional, touching, and unforgettable.',
  2021,
  128,
  'https://via.placeholder.com/300x450/FF69B4/FFFFFF?text=Romantic+Drama',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_5',
  NULL,
  ARRAY['Romance', 'Drama']
),
(
  'Documentary: Nature',
  'Explore the wonders of our natural world. Breathtaking cinematography and fascinating insights.',
  2023,
  87,
  'https://via.placeholder.com/300x450/228B22/FFFFFF?text=Documentary',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_6',
  NULL,
  ARRAY['Documentary']
),
(
  'Animated Adventure',
  'A family-friendly animated adventure with lovable characters and important life lessons.',
  2022,
  95,
  'https://via.placeholder.com/300x450/FFA500/000000?text=Animation',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_7',
  NULL,
  ARRAY['Animation', 'Adventure', 'Family']
),
(
  'Crime Thriller',
  'A gripping crime drama with unexpected twists. Follow detectives as they unravel a complex case.',
  2024,
  134,
  'https://via.placeholder.com/300x450/4B0082/FFFFFF?text=Crime+Thriller',
  'REPLACE_WITH_YOUR_DRIVE_FILE_ID_8',
  NULL,
  ARRAY['Crime', 'Thriller', 'Drama']
);

-- ============================================
-- HOW TO USE THIS FILE
-- ============================================
-- 1. Upload test videos to Google Drive
-- 2. Make them publicly accessible (Anyone with link can view)
-- 3. Get the file IDs from the share links
-- 4. Replace 'REPLACE_WITH_YOUR_DRIVE_FILE_ID_X' with actual IDs
-- 5. Run this SQL in Supabase SQL Editor
-- 6. Your test movies will appear in the app!

-- ============================================
-- CLEANUP (if needed)
-- ============================================
-- To remove all sample data:
-- DELETE FROM watch_progress;
-- DELETE FROM movies WHERE description LIKE '%sample%' OR description LIKE '%test%';

-- ============================================
-- NOTES
-- ============================================
-- - Poster URLs use placeholder images
-- - Replace with real poster URLs for better appearance
-- - Subtitle file IDs are NULL (optional)
-- - Adjust duration_minutes to match actual video length
-- - Genres can be customized as needed

