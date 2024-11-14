import axios from 'axios';

const REDIRECT_URI = 'http://localhost:3000';
const SCOPE = 'user-top-read user-read-private user-read-email';
const API_BASE_URL = 'https://api.spotify.com/v1';

// Create axios instance with default config
const spotifyApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle token
spotifyApi.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('spotify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiry
spotifyApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Force a new login since we're using implicit grant
      await handleTokenExpiry();
      
      // Redirect to login
      window.location.href = getAuthUrl(process.env.REACT_APP_SPOTIFY_CLIENT_ID);
      return Promise.reject(new Error('Session expired. Redirecting to login...'));
    }

    return Promise.reject(error);
  }
);

// Helper function to handle token expiry
const handleTokenExpiry = async () => {
  localStorage.removeItem('spotify_token');
  // You could dispatch a Redux action or update React context here if needed
};

export const getAuthUrl = (clientId) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    show_dialog: false,
    state: Math.random().toString(36).substring(7)
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const validateToken = async (accessToken) => {
  try {
    const response = await spotifyApi.get('/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const fetchUserTopArtists = async () => {
  try {
    const response = await spotifyApi.get('/me/top/artists', {
      params: {
        limit: 20,
        time_range: 'medium_term'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top artists:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await spotifyApi.get('/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get user profile:', error);
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

// Export the axios instance for other components to use
export default spotifyApi;