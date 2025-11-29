import { useState } from 'react';
import { useMovies } from '../contexts/MovieContext';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const { searchMovies } = useMovies();

  const handleSubmit = (e) => {
    e.preventDefault();
    searchMovies(query);
  };

  const handleClear = () => {
    setQuery('');
    searchMovies('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies or series..."
          className="input-field pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white px-3"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="bg-flix-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;

