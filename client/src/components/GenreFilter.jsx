import { useMovies } from '../contexts/MovieContext';

const GenreFilter = () => {
  const { selectedGenre, filterByGenre } = useMovies();

  const genres = [
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Sci-Fi',
    'Romance',
    'Thriller',
    'Documentary',
    'Animation',
    'Fantasy'
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => filterByGenre('')}
        className={`px-4 py-2 rounded transition-colors ${
          selectedGenre === ''
            ? 'bg-flix-red text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => filterByGenre(genre)}
          className={`px-4 py-2 rounded transition-colors ${
            selectedGenre === genre
              ? 'bg-flix-red text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;

