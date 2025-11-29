-- ============================================
-- SERIES & EPISODES SUPPORT
-- ============================================

-- Drop old movies table and recreate with content_type
DROP TABLE IF EXISTS watch_progress CASCADE;
DROP TABLE IF EXISTS movies CASCADE;

-- ============================================
-- CONTENT TABLE (Movies + Series)
-- ============================================
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  poster_url TEXT,
  genres TEXT[],
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'series')),
  
  -- For movies
  duration_minutes INTEGER,
  google_drive_file_id TEXT,
  subtitle_file_id TEXT,
  
  -- For series
  total_seasons INTEGER,
  total_episodes INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT content_year_valid CHECK (year IS NULL OR (year >= 1800 AND year <= 2200))
);

-- ============================================
-- SEASONS TABLE
-- ============================================
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT seasons_unique_number UNIQUE(content_id, season_number),
  CONSTRAINT seasons_number_valid CHECK (season_number > 0)
);

-- ============================================
-- EPISODES TABLE
-- ============================================
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  google_drive_file_id TEXT NOT NULL,
  subtitle_file_id TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT episodes_unique_number UNIQUE(season_id, episode_number),
  CONSTRAINT episodes_number_valid CHECK (episode_number > 0)
);

-- ============================================
-- WATCH PROGRESS TABLE (Updated)
-- ============================================
CREATE TABLE watch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Can track either movie or episode
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  
  progress_seconds INTEGER DEFAULT 0 NOT NULL,
  total_duration INTEGER,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT watch_progress_content_or_episode CHECK (
    (content_id IS NOT NULL AND episode_id IS NULL) OR
    (content_id IS NULL AND episode_id IS NOT NULL)
  ),
  CONSTRAINT watch_progress_seconds_valid CHECK (progress_seconds >= 0)
);

-- ============================================
-- GOOGLE DRIVE SYNC TRACKING
-- ============================================
CREATE TABLE drive_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id TEXT NOT NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('movies', 'series')),
  items_found INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX content_title_idx ON content(title);
CREATE INDEX content_type_idx ON content(content_type);
CREATE INDEX content_year_idx ON content(year);
CREATE INDEX content_genres_idx ON content USING GIN(genres);
CREATE INDEX content_created_at_idx ON content(created_at DESC);

CREATE INDEX seasons_content_id_idx ON seasons(content_id);
CREATE INDEX seasons_number_idx ON seasons(season_number);

CREATE INDEX episodes_season_id_idx ON episodes(season_id);
CREATE INDEX episodes_number_idx ON episodes(episode_number);
CREATE INDEX episodes_drive_file_idx ON episodes(google_drive_file_id);

CREATE INDEX watch_progress_profile_id_idx ON watch_progress(profile_id);
CREATE INDEX watch_progress_content_id_idx ON watch_progress(content_id);
CREATE INDEX watch_progress_episode_id_idx ON watch_progress(episode_id);
CREATE INDEX watch_progress_updated_at_idx ON watch_progress(updated_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_sync_log ENABLE ROW LEVEL SECURITY;

-- Content policies
CREATE POLICY "Authenticated users can view content"
  ON content FOR SELECT TO authenticated USING (true);

-- Seasons policies
CREATE POLICY "Authenticated users can view seasons"
  ON seasons FOR SELECT TO authenticated USING (true);

-- Episodes policies
CREATE POLICY "Authenticated users can view episodes"
  ON episodes FOR SELECT TO authenticated USING (true);

-- Watch progress policies
CREATE POLICY "Users can view their own progress"
  ON watch_progress FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own progress"
  ON watch_progress FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own progress"
  ON watch_progress FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own progress"
  ON watch_progress FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Drive sync log policies (admin only via service role)
CREATE POLICY "Service role can manage sync log"
  ON drive_sync_log FOR ALL
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_progress_updated_at
  BEFORE UPDATE ON watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR EASIER QUERIES
-- ============================================

-- View to get all content with episode counts for series
CREATE VIEW content_with_details AS
SELECT 
  c.*,
  CASE 
    WHEN c.content_type = 'series' THEN (
      SELECT COUNT(*) FROM episodes e
      JOIN seasons s ON e.season_id = s.id
      WHERE s.content_id = c.id
    )
    ELSE 0
  END as episode_count
FROM content c;

-- View to get episodes with season info
CREATE VIEW episodes_with_season AS
SELECT 
  e.*,
  s.season_number,
  s.content_id,
  c.title as series_title
FROM episodes e
JOIN seasons s ON e.season_id = s.id
JOIN content c ON s.content_id = c.id;

