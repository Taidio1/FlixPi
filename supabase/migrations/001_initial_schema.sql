-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profiles (multiple profiles per user)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#FF0000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT profiles_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50)
);

-- Index for faster queries
CREATE INDEX profiles_user_id_idx ON profiles(user_id);

-- ============================================
-- MOVIES TABLE
-- ============================================
-- Stores movie/series metadata
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  duration_minutes INTEGER,
  poster_url TEXT,
  google_drive_file_id TEXT NOT NULL,
  subtitle_file_id TEXT,
  genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT movies_title_length CHECK (char_length(title) >= 1),
  CONSTRAINT movies_year_valid CHECK (year IS NULL OR (year >= 1800 AND year <= 2200)),
  CONSTRAINT movies_duration_valid CHECK (duration_minutes IS NULL OR duration_minutes >= 0)
);

-- Indexes for search and filtering
CREATE INDEX movies_title_idx ON movies(title);
CREATE INDEX movies_year_idx ON movies(year);
CREATE INDEX movies_genres_idx ON movies USING GIN(genres);
CREATE INDEX movies_created_at_idx ON movies(created_at DESC);

-- ============================================
-- WATCH PROGRESS TABLE
-- ============================================
-- Tracks user watch progress for each movie
CREATE TABLE watch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0 NOT NULL,
  total_duration INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT watch_progress_unique_profile_movie UNIQUE(profile_id, movie_id),
  CONSTRAINT watch_progress_seconds_valid CHECK (progress_seconds >= 0),
  CONSTRAINT watch_progress_duration_valid CHECK (total_duration IS NULL OR total_duration >= 0)
);

-- Indexes
CREATE INDEX watch_progress_profile_id_idx ON watch_progress(profile_id);
CREATE INDEX watch_progress_movie_id_idx ON watch_progress(movie_id);
CREATE INDEX watch_progress_updated_at_idx ON watch_progress(updated_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profiles
CREATE POLICY "Users can view their own profiles"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own profiles
CREATE POLICY "Users can create their own profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profiles
CREATE POLICY "Users can delete their own profiles"
  ON profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MOVIES POLICIES
-- ============================================

-- All authenticated users can view movies
CREATE POLICY "Authenticated users can view movies"
  ON movies
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert movies (via backend)
-- Note: This will be handled by the backend using service role key

-- ============================================
-- WATCH PROGRESS POLICIES
-- ============================================

-- Users can view progress for their own profiles
CREATE POLICY "Users can view their own progress"
  ON watch_progress
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert progress for their own profiles
CREATE POLICY "Users can insert their own progress"
  ON watch_progress
  FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update progress for their own profiles
CREATE POLICY "Users can update their own progress"
  ON watch_progress
  FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete progress for their own profiles
CREATE POLICY "Users can delete their own progress"
  ON watch_progress
  FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for movies table
CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for watch_progress table
CREATE TRIGGER update_watch_progress_updated_at
  BEFORE UPDATE ON watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- You can add sample movies here for testing
-- Example:
-- INSERT INTO movies (title, description, year, duration_minutes, google_drive_file_id, genres)
-- VALUES (
--   'Sample Movie',
--   'This is a sample movie for testing',
--   2024,
--   120,
--   'your_google_drive_file_id_here',
--   ARRAY['Action', 'Thriller']
-- );

