import supabase from '../config/supabase.js';

export const getUserWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's watchlist
    const { data: watchlist, error } = await supabase
      .from('watchlist')
      .select('*, content(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Watchlist query error:', error);
      return res.status(500).json({ error: 'Failed to fetch watchlist' });
    }

    res.json(watchlist || []);
  } catch (error) {
    console.error('Watchlist controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content_id } = req.body;

    // Check if already in watchlist
    const { data: existing } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', content_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Content already in watchlist' });
    }

    // Add to watchlist
    const { data, error } = await supabase
      .from('watchlist')
      .insert([{ user_id: userId, content_id }])
      .select()
      .single();

    if (error) {
      console.error('Add to watchlist error:', error);
      return res.status(500).json({ error: 'Failed to add to watchlist' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Add to watchlist controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', movieId);

    if (error) {
      console.error('Remove from watchlist error:', error);
      return res.status(500).json({ error: 'Failed to remove from watchlist' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove from watchlist controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

