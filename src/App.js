import React, { useState, useEffect } from 'react';
import ChartComponent from './components/chart_component';
import InteractiveArtistRankings from './components/InteractiveArtistRankings';
import { 
  getAuthUrl, 
  validateToken, 
  fetchUserTopArtists, 
  getTokenFromUrl,
  getUserProfile 
} from './components/auth/spotify_service';

const CLIENT_ID = '6f0680f2317545fd8d2a7bd3263b4d51';

function App() {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const loadUserData = async (accessToken) => {
    setError(null);
    setLoading(true);
    try {
      const [topArtistsData, profileData] = await Promise.all([
        fetchUserTopArtists(accessToken),
        getUserProfile(accessToken)
      ]);
      
      setUserData(topArtistsData);
      setUserProfile(profileData);
    } catch (err) {
      setError(err.message || 'Failed to load user data');
      if (err.message.includes('Session expired') || err.message.includes('invalid')) {
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_refresh_token');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // First check localStorage
      const storedToken = localStorage.getItem('spotify_token');
      if (storedToken) {
        const isValid = await validateToken(storedToken);
        if (isValid) {
          setToken(storedToken);
          return;
        }
      }

      // Then check URL hash
      const tokenData = getTokenFromUrl();
      if (tokenData.accessToken) {
        const isValid = await validateToken(tokenData.accessToken);
        if (isValid) {
          localStorage.setItem('spotify_token', tokenData.accessToken);
          setToken(tokenData.accessToken);
        } else {
          setError('Invalid access token received');
        }
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

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_refresh_token');
    setToken(null);
    setUserData(null);
    setUserProfile(null);
    setSelectedArtist(null);
  };

  const handleArtistClick = (artistData) => {
    setSelectedArtist(artistData);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
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
      {!token ? (
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
        >
          Login with Spotify
        </button>
      ) : (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Data Spot</h1>
              {userProfile && (
                <p className="text-gray-600">
                  Welcome, {userProfile.display_name}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </div>
          
          <p className="mb-6">
            Welcome to Data Spot, where you can see all the data from your favorite artists
          </p>
          
          {userData && (
            <>
              <h2 className="text-2xl font-semibold mb-4">Your Top Artists</h2>
              <ChartComponent userData={userData} onArtistClick={handleArtistClick} />
              {selectedArtist && (
                <InteractiveArtistRankings artistId={selectedArtist.id} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
