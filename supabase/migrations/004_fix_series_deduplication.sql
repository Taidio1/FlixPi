-- ============================================
-- FIX SERIES DEDUPLICATION
-- ============================================
-- This migration ensures series are uniquely identified by google_drive_file_id
-- to prevent duplicates during synchronization

-- Step 1: Find and merge duplicate series (if any exist)
-- This handles edge cases where duplicates were created before this fix

-- Identify duplicate series by title (keep oldest)
WITH duplicate_series AS (
  SELECT 
    title,
    content_type,
    array_agg(id ORDER BY created_at ASC) as ids,
    COUNT(*) as count
  FROM content
  WHERE content_type = 'series'
  GROUP BY title, content_type
  HAVING COUNT(*) > 1
),
series_to_keep AS (
  SELECT 
    title,
    ids[1] as keep_id,
    ids[2:] as delete_ids
  FROM duplicate_series
)
-- Reassign seasons from duplicate series to the kept series
UPDATE seasons
SET content_id = (
  SELECT keep_id 
  FROM series_to_keep 
  WHERE id IN (SELECT unnest(delete_ids) FROM series_to_keep)
)
WHERE content_id IN (
  SELECT unnest(delete_ids) FROM series_to_keep
);

-- Delete duplicate series (seasons are now reassigned)
DELETE FROM content
WHERE id IN (
  SELECT unnest(delete_ids) FROM series_to_keep
);

-- Step 2: Add unique constraint on google_drive_file_id for series
-- This prevents future duplicates

-- First, drop existing index if it conflicts
DROP INDEX IF EXISTS content_drive_file_unique;

-- Create partial unique index (only for series with non-null google_drive_file_id)
-- This allows multiple movies with NULL (for manually added content)
-- but enforces uniqueness for series folders
CREATE UNIQUE INDEX content_series_drive_file_unique 
  ON content (google_drive_file_id) 
  WHERE content_type = 'series' AND google_drive_file_id IS NOT NULL;

-- Step 3: Add index for faster queries by drive file ID
CREATE INDEX IF NOT EXISTS content_drive_file_idx ON content(google_drive_file_id);

-- Step 4: Log this migration
INSERT INTO drive_sync_log (
  folder_id, 
  sync_type, 
  items_found, 
  items_added, 
  items_updated, 
  status, 
  error_message
) VALUES (
  'migration',
  'series',
  0,
  0,
  0,
  'success',
  'Added unique constraint on google_drive_file_id for series deduplication'
);

-- ============================================
-- DOCUMENTATION
-- ============================================
-- After this migration:
-- 1. Each series is uniquely identified by its Google Drive folder ID
-- 2. Duplicate series (if any) have been merged
-- 3. Future synchronizations will NOT create duplicates
-- 4. Movies can still have NULL google_drive_file_id (manual entries)
-- 5. Series MUST have google_drive_file_id for deduplication to work

COMMENT ON INDEX content_series_drive_file_unique IS 
  'Ensures each Google Drive series folder is synced only once (no duplicates)';
