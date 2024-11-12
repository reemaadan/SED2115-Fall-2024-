import React, { useState, useEffect } from 'react';

const SpotifySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['artist', 'album', 'playlist']);
  const [results, setResults] = useState({ artists: [], albums: [], playlists: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Simulated search function - replace with actual Spotify API call
  const searchSpotify = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = 'https://api.spotify.com/v1/search';
      const typeParam = selectedTypes.join(',');
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `${baseUrl}?q=${encodedQuery}&type=${typeParam}`;

      // Mock data for demonstration - replace with actual API call
      const mockResults = {
        artists: selectedTypes.includes('artist') ? [
          { id: '1', name: 'Artist 1', images: [{ url: '/api/placeholder/300/300' }] },
          { id: '2', name: 'Artist 2', images: [{ url: '/api/placeholder/300/300' }] }
        ] : [],
        albums: selectedTypes.includes('album') ? [
          { id: '1', name: 'Album 1', images: [{ url: '/api/placeholder/300/300' }] },
          { id: '2', name: 'Album 2', images: [{ url: '/api/placeholder/300/300' }] }
        ] : [],
        playlists: selectedTypes.includes('playlist') ? [
          { id: '1', name: 'Playlist 1', images: [{ url: '/api/placeholder/300/300' }] },
          { id: '2', name: 'Playlist 2', images: [{ url: '/api/placeholder/300/300' }] }
        ] : []
      };

      setResults(mockResults);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchSpotify();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTypes]);

  const ResultCard = ({ item, type }) => (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
      <img 
        src={item.images[0]?.url} 
        alt={`${item.name} ${type}`}
        className="w-32 h-32 object-cover rounded-lg mb-2"
      />
      <p className="text-center font-medium text-sm truncate w-full">{item.name}</p>
      <p className="text-xs text-gray-500 capitalize">{type}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for artists, albums, or playlists..."
          className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Filter Toggles */}
      <div className="flex gap-2">
        {['artist', 'album', 'playlist'].map((type) => (
          <button
            key={type}
            onClick={() => handleTypeToggle(type)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedTypes.includes(type)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading results...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {!isLoading && !error && searchQuery && (
        <div className="space-y-6">
          {selectedTypes.includes('artist') && results.artists.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.artists.map(artist => (
                  <ResultCard key={artist.id} item={artist} type="artist" />
                ))}
              </div>
            </div>
          )}

          {selectedTypes.includes('album') && results.albums.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.albums.map(album => (
                  <ResultCard key={album.id} item={album} type="album" />
                ))}
              </div>
            </div>
          )}

          {selectedTypes.includes('playlist') && results.playlists.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.playlists.map(playlist => (
                  <ResultCard key={playlist.id} item={playlist} type="playlist" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotifySearch;