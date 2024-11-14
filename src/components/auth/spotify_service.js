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
    show_dialog: true
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const validateToken = async (accessToken) => {
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
    if (error.response?.status === 401) {
      throw new Error('Access token expired or invalid. Please log in again.');
    }
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    await axios.get(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return true;
  } catch {
    return false;
  }
};