import React, { useState, useEffect } from 'react';
import ChartComponent from './components/chart_component';
import InteractiveArtistRankings from './components/InteractiveArtistRankings';
import { 
  getAuthUrl, 
  validateToken, 
  fetchUserTopArtists,
  getTokenFromUrl,
} from './components/auth/spotify_service';
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

console.log(CLIENT_ID);

function App() {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (accessToken) => {
    setError(null);
    try {
      const data = await fetchUserTopArtists(accessToken);
      setUserData(data);
    } catch (err) {
      setError(err.message || 'Failed to load user data');
      setToken(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getTokenFromUrl();
        if (accessToken) {
          const isValid = await validateToken(accessToken);
          if (isValid) {
            setToken(accessToken);
          } else {
            setError('Invalid access token received');
          }
        }
      } catch (err) {
        setError('Failed to initialize authentication');
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  const handleLogin = () => {
    window.location.href = getAuthUrl(CLIENT_ID);
  };

  const handleArtistClick = (artistData) => {
    setSelectedArtist(artistData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
        >
          Login Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {!token && (
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
        >
          Login with Spotify
        </button>
      )}
      {userData && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-2">Data Spot</h1>
          <p className="mb-6">
            Welcome to Data Spot, where you can see all the data from your favorite artists
          </p>
          <h2 className="text-2xl font-semibold mb-4">Your Top Artists</h2>
          <ChartComponent userData={userData} onArtistClick={handleArtistClick} />
          {selectedArtist && (
            <InteractiveArtistRankings artistId={selectedArtist.id} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;