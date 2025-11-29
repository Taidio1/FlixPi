-- ============================================
-- WATCHLIST TABLE
-- ============================================
-- Stores user's watchlist (movies they want to watch later)
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure a user can only have a movie once in watchlist
  CONSTRAINT watchlist_unique_user_movie UNIQUE (user_id, movie_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_movie_id_idx ON watchlist(movie_id);

-- RLS Policies
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Users can only see their own watchlist items
CREATE POLICY watchlist_select_own ON watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their own watchlist
CREATE POLICY watchlist_insert_own ON watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own watchlist
CREATE POLICY watchlist_delete_own ON watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

