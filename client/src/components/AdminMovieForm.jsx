import { useState } from 'react';
import { movieService } from '../services/movieService';

const AdminMovieForm = ({ onSuccess, movie = null }) => {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    year: movie?.year || new Date().getFullYear(),
    duration_minutes: movie?.duration_minutes || 0,
    poster_url: movie?.poster_url || '',
    google_drive_file_id: movie?.google_drive_file_id || '',
    subtitle_file_id: movie?.subtitle_file_id || '',
    genres: movie?.genres?.join(', ') || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const movieData = {
        ...formData,
        genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean),
      };

      if (movie) {
        await movieService.updateMovie(movie.id, movieData);
      } else {
        await movieService.createMovie(movieData);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500 text-white p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-white text-sm mb-2">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-2">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="input-field"
            min="1900"
            max="2100"
          />
        </div>

        <div>
          <label className="block text-white text-sm mb-2">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            className="input-field"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Poster URL</label>
        <input
          type="url"
          name="poster_url"
          value={formData.poster_url}
          onChange={handleChange}
          className="input-field"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Google Drive File ID *</label>
        <input
          type="text"
          name="google_drive_file_id"
          value={formData.google_drive_file_id}
          onChange={handleChange}
          className="input-field"
          placeholder="1a2b3c4d5e6f7g8h9i0j"
          required
        />
        <p className="text-gray-400 text-xs mt-1">
          Extract from Drive URL: https://drive.google.com/file/d/<strong>FILE_ID</strong>/view
        </p>
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Subtitle File ID (optional)</label>
        <input
          type="text"
          name="subtitle_file_id"
          value={formData.subtitle_file_id}
          onChange={handleChange}
          className="input-field"
          placeholder="1a2b3c4d5e6f7g8h9i0j"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Genres (comma-separated)</label>
        <input
          type="text"
          name="genres"
          value={formData.genres}
          onChange={handleChange}
          className="input-field"
          placeholder="Action, Thriller, Sci-Fi"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Saving...' : movie ? 'Update Movie' : 'Add Movie'}
      </button>
    </form>
  );
};

export default AdminMovieForm;

