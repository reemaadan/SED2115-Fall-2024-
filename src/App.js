import React, { useState, useEffect } from 'react';
import ChartComponent from './chart_component';
import { getAuthUrl, validateToken, fetchUserTopArtists } from './spotify_service';
import './App.css';

const CLIENT_ID = '6f0680f2317545fd8d2a7bd3263b4d51';

function App() {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const loadUserData = async (accessToken) => {
    setError(null);
    
    try {
      const data = await fetchUserTopArtists(accessToken);
      setUserData(data);
    } catch (err) {
      setError(err.message || 'Failed to load user data');
      setToken(null); // this is important, for some reason it will remember the old dead tokens so you have to reset it when there are new 
    } 
  };

  useEffect(() => {
    const getTokenFromUrl = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        const isValid = await validateToken(accessToken);
        if (isValid) {
          setToken(accessToken);
        } else {
          setError('Invalid access token received');
        }
      }
    };

    getTokenFromUrl();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  const handleLogin = () => {
    window.location.href = getAuthUrl(CLIENT_ID);
  };

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
          <ChartComponent userData={userData} />
        </div>
      )}
    </div>
  );
}

export default App;