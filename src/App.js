import React, { useState, useEffect } from 'react';
import ChartComponent from './chart_component';
import { getAuthUrl, validateToken, fetchUserTopArtists } from './spotify_service';

// Your Spotify application's client ID
// Get this from Spotify Developer Dashboard
const CLIENT_ID = '6f0680f2317545fd8d2a7bd3263b4d51';

function App() {
  // State variables to manage our application's data and UI
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Fetches user's top artists from Spotify
   * Shows loading state and handles errors
   * @param {string} accessToken - Valid Spotify access token
   */
  const loadUserData = async (accessToken) => {
    // Start loading and clear any previous errors
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch the user's top artists
      const data = await fetchUserTopArtists(accessToken);
      setUserData(data);
    } catch (err) {
      // If something goes wrong, show error and clear token
      setError(err.message || 'Failed to load user data');
      setToken(null); // Clear invalid token so user can try logging in again
    } 
  };

  
  // This effect runs once when the component mounts
  // It checks for a token in the URL (after Spotify login redirect)
  useEffect(() => {
    const getTokenFromUrl = async () => {
      // Get the hash portion of the URL (everything after #)
      const hash = window.location.hash;
      if (!hash) return;

      // Parse the hash to get the access token
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        / Make sure the token is valid before using it
        const isValid = await validateToken(accessToken);
        if (isValid) {
          setToken(accessToken);
        } else {
          setError('Invalid access token received');
        }
      }
    };

    getTokenFromUrl();
  }, []); // Empty array means this only runs once when component mounts

  // This effect runs whenever the token changes
  // It loads the user's data if we have a valid token
  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  /**
   * Redirects the user to Spotify's login page
   * This starts the authentication process
   */
  const handleLogin = () => {
    window.location.href = getAuthUrl(CLIENT_ID);
  };

  // If there's an error, show it and a button to try again
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

  // Main component render
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
          <ChartComponent userData={userData} />
        </div>
      )}
    </div>
  );
}

export default App;
