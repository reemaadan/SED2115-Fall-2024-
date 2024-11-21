// spotify_service.js

import axios from 'axios';

const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000';
const SCOPE = 'user-top-read';
const API_BASE_URL = 'https://api.spotify.com/v1';

export const getAuthUrl = (clientId) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    show_dialog: true
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getTokenFromUrl = () => {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.substring(1));
  return params.get('access_token');
};

export const validateToken = async (accessToken) => {
  if (!accessToken) return false;
  
  try {
    await axios.get(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const fetchUserTopArtists = async (accessToken) => {
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/me/top/artists`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 20,
        time_range: 'medium_term' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Access token expired or invalid. Please log in again.');
    }
    throw error;
  }
};

// Add this new function
export const fetchUserTopTracks = async (accessToken) => {
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/me/top/tracks`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 20,
        time_range: 'medium_term' 
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Access token expired or invalid. Please log in again.');
    }
    throw error;
  }
};

export const getUserProfile = async (accessToken) => {
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Access token expired or invalid. Please log in again.');
    }
    throw error;
  }
};
