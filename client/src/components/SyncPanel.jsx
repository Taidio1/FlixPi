import { useState } from 'react';
import api from '../services/api';

const SyncPanel = ({ onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSync = async (type) => {
    setSyncing(true);
    setError('');
    setResults(null);

    try {
      const endpoint = type === 'all' ? '/sync/all' : `/sync/${type}`;
      const response = await api.post(endpoint);
      
      setResults(response.data);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to sync ${type}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-flix-gray rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Sync from Google Drive
      </h2>
      
      <p className="text-gray-400 mb-6">
        Automatically scan your Google Drive folders and import movies/series to the database.
      </p>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded p-4 mb-4">
          <h3 className="text-green-400 font-semibold mb-2">Sync Completed!</h3>
          
          {results.results ? (
            <div className="space-y-3">
              {results.results.movies && (
                <div className="text-white">
                  <strong className="text-green-400">Movies:</strong>
                  <div className="ml-4 mt-1 text-sm">
                    <div>✅ Found: <span className="font-semibold">{results.results.movies.itemsFound}</span></div>
                    <div>➕ Added: <span className="font-semibold text-green-400">{results.results.movies.itemsAdded}</span></div>
                    <div>♻️  Updated: <span className="font-semibold text-blue-400">{results.results.movies.itemsUpdated}</span></div>
                    {(results.results.movies.itemsFound - results.results.movies.itemsAdded - results.results.movies.itemsUpdated) > 0 && (
                      <div>⏭️  Skipped (already synced): <span className="font-semibold text-gray-400">
                        {results.results.movies.itemsFound - results.results.movies.itemsAdded - results.results.movies.itemsUpdated}
                      </span></div>
                    )}
                  </div>
                </div>
              )}
              {results.results.series && (
                <div className="text-white">
                  <strong className="text-purple-400">Series:</strong>
                  <div className="ml-4 mt-1 text-sm">
                    <div>✅ Found: <span className="font-semibold">{results.results.series.itemsFound}</span> episodes</div>
                    <div>➕ Added: <span className="font-semibold text-green-400">{results.results.series.itemsAdded}</span></div>
                    <div>♻️  Updated: <span className="font-semibold text-blue-400">{results.results.series.itemsUpdated}</span></div>
                    {(results.results.series.itemsFound - results.results.series.itemsAdded - results.results.series.itemsUpdated) > 0 && (
                      <div>⏭️  Skipped (already synced): <span className="font-semibold text-gray-400">
                        {results.results.series.itemsFound - results.results.series.itemsAdded - results.results.series.itemsUpdated}
                      </span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-white">
              <div>✅ Found: {results.itemsFound}</div>
              <div>➕ Added: <span className="text-green-400">{results.itemsAdded}</span></div>
              <div>♻️  Updated: <span className="text-blue-400">{results.itemsUpdated}</span></div>
              {(results.itemsFound - results.itemsAdded - results.itemsUpdated) > 0 && (
                <div>⏭️  Skipped: <span className="text-gray-400">
                  {results.itemsFound - results.itemsAdded - results.itemsUpdated}
                </span></div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleSync('movies')}
          disabled={syncing}
          className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Movies'}
        </button>

        <button
          onClick={() => handleSync('series')}
          disabled={syncing}
          className="bg-purple-600 text-white px-6 py-3 rounded font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Series'}
        </button>

        <button
          onClick={() => handleSync('all')}
          disabled={syncing}
          className="bg-flix-red text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p><strong>Expected folder structure:</strong></p>
        <pre className="bg-black bg-opacity-50 p-3 rounded mt-2 overflow-x-auto">
{`Movies Folder/
  Movie Title (2023).mp4
  Another Movie (2022).mkv

Series Folder/
  Breaking Bad/
    Season 1/
      S01E01 - Pilot.mp4
      S01E02 - Episode 2.mp4
    Season 2/
      S02E01.mp4`}
        </pre>
      </div>
    </div>
  );
};

export default SyncPanel;

