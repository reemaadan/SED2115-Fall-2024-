import axios from 'axios';

const REDIRECT_URI = 'http://localhost:3000';
const SCOPE = 'user-top-read user-read-private user-read-email';
const API_BASE_URL = 'https://api.spotify.com/v1';

export const getAuthUrl = (clientId) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    show_dialog: true,
    state: Math.random().toString(36).substring(7)
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
      // Token expired, attempt to refresh
      try {
        const newToken = await refreshAccessToken(accessToken);
        if (newToken) {
          localStorage.setItem('spotify_token', newToken);
          return fetchUserTopArtists(newToken);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        localStorage.removeItem('spotify_token');
        throw new Error('Session expired. Please log in again.');
      }
    }
    if (error.response?.status === 403) {
      throw new Error('Access forbidden. Please check your permissions.');
    }
    console.error('Failed to fetch top artists:', error);
    throw error;
  }
};

export const refreshAccessToken = async (expiredToken) => {
  try {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    });

    const { data } = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: params
    });

    // Store the new refresh token if one is provided
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }

    return data.access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

export const validateToken = async (accessToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.status === 200;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token is expired, attempt to refresh
      try {
        const newToken = await refreshAccessToken(accessToken);
        if (newToken) {
          localStorage.setItem('spotify_token', newToken);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    console.error('Token validation error:', error);
    return false;
  }
};

export const getUserProfile = async (accessToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken(accessToken);
        if (newToken) {
          return getUserProfile(newToken);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        throw new Error('Session expired. Please log in again.');
      }
    }
    throw error;
  }
};

// Helper function to parse token from URL
export const getTokenFromUrl = () => {
  const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce((initial, item) => {
      if (item) {
        const parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});

  // Clear the hash from the URL
  window.location.hash = '';
  
  return {
    accessToken: hash.access_token,
    tokenType: hash.token_type,
    expiresIn: hash.expires_in,
    state: hash.state
  };
};
