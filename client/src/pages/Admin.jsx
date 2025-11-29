import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieService } from '../services/movieService';
import AdminMovieForm from '../components/AdminMovieForm';
import SyncPanel from '../components/SyncPanel';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  useEffect(() => {
    // Admin check is done by backend
    // Just load movies if user exists
    if (!user) {
      navigate('/login');
      return;
    }

    loadMovies();
  }, [user, navigate]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getMovies();
      setMovies(data);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      await movieService.deleteMovie(id);
      loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMovie(null);
    loadMovies();
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  return (
    <div>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
            <button onClick={handleAddNew} className="btn-primary">
              + Add New Movie
            </button>
          </div>

          {/* Sync Panel */}
          <div className="mb-8">
            <SyncPanel onSyncComplete={loadMovies} />
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-flix-gray rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    {editingMovie ? 'Edit Movie' : 'Add New Movie'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingMovie(null);
                    }}
                    className="text-white text-3xl hover:text-gray-400"
                  >
                    ×
                  </button>
                </div>
                <AdminMovieForm movie={editingMovie} onSuccess={handleFormSuccess} />
              </div>
            </div>
          )}

          {/* Movies List */}
          {loading ? (
              <div className="flex justify-center py-20">
              <div className="text-foreground text-xl">Loading...</div>
            </div>
          ) : (
            <div className="bg-flix-gray rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-black bg-opacity-50">
                  <tr>
                    <th className="text-left p-4 text-white">Title</th>
                    <th className="text-left p-4 text-white">Year</th>
                    <th className="text-left p-4 text-white">Duration</th>
                    <th className="text-left p-4 text-white">Genres</th>
                    <th className="text-right p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id} className="border-t border-gray-700 hover:bg-black hover:bg-opacity-25">
                      <td className="p-4 text-white font-semibold">{movie.title}</td>
                      <td className="p-4 text-gray-300">{movie.year || '-'}</td>
                      <td className="p-4 text-gray-300">
                        {movie.duration_minutes ? `${movie.duration_minutes} min` : '-'}
                      </td>
                      <td className="p-4 text-gray-300">
                        {movie.genres?.join(', ') || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEdit(movie)}
                          className="text-blue-400 hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {movies.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  No movies found. Add your first movie!
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

