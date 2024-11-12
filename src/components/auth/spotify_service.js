import axios from 'axios';

const REDIRECT_URI = 'http://localhost:3000';
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

export const getSpotifyToken = async (clientId, clientSecret) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const { data } = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: params
    });
    
    return data;
  } catch (error) {
    console.error('Failed to get Spotify token:', error);
    throw error;
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

export const validateToken = async (accessToken) => {
  try {
    await axios.get(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return true;
  } catch {
    return false;
  }
};