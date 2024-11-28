// Import Axios library for making HTTP requests
import axios from 'axios';

// Define constants for the Spotify API
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000'; // Redirect URI after authentication
const SCOPE = 'user-top-read'; // Permissions your app is requesting
const API_BASE_URL = 'https://api.spotify.com/v1'; // Base URL for Spotify API

// Function to generate the Spotify authentication URL
export const getAuthUrl = (clientId) => {
  // Create URL parameters
  const params = new URLSearchParams({
    client_id: clientId, // Your Spotify Client ID
    response_type: 'token', // Implicit Grant Flow (returns token directly)
    redirect_uri: REDIRECT_URI, // Where to redirect after authentication
    scope: SCOPE, // Permissions requested
    show_dialog: true // Show the authentication dialog every time
  });
  
  // Return the full authentication URL
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Function to extract the access token from the URL after redirect
export const getTokenFromUrl = () => {
  const hash = window.location.hash; // Get the URL fragment (after '#')
  if (!hash) return null; // If no hash, return null
  const params = new URLSearchParams(hash.substring(1)); // Parse parameters
  return params.get('access_token'); // Return the access token
};

// Function to validate the access token by making a test API call
export const validateToken = async (accessToken) => {
  if (!accessToken) return false; // No token means invalid
  try {
    // Make a request to the '/me' endpoint to test the token
    await axios.get(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return true; // If successful, token is valid
  } catch (error) {
    console.error('Token validation error:', error);
    return false; // If error, token is invalid
  }
};

// Function to fetch the user's top artists
export const fetchUserTopArtists = async (accessToken) => {
  if (!accessToken) {
    throw new Error('No access token provided'); // Throw error if no token
  }

  try {
    // Make a GET request to '/me/top/artists'
    const response = await axios.get(`${API_BASE_URL}/me/top/artists`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 20, // Number of artists to retrieve
        time_range: 'medium_term' // Time range (last 6 months)
      }
    });
    return response.data; // Return the data
  } catch (error) {
    // Handle specific error status codes
    if (error.response?.status === 401) {
      throw new Error(`Failed with status ${error.response?.status}: ${error.message}`);
    }
    throw error; // Throw other errors
  }
};

// Function to fetch the user's top tracks
export const fetchUserTopTracks = async (accessToken) => {
  if (!accessToken) {
    throw new Error('No access token provided'); // Throw error if no token
  }

  try {
    // Make a GET request to '/me/top/tracks'
    const response = await axios.get(`${API_BASE_URL}/me/top/tracks`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 20, // Number of tracks to retrieve
        time_range: 'medium_term' // Time range (last 6 months)
      }
    });
    return response.data; // Return the data
  } catch (error) {
    // Handle specific error status codes
    if (error.response?.status === 401) {
      throw new Error('Access token expired or invalid. Please log in again.');
    }
    throw error; // Throw other errors
  }
};

// Function to get the user's profile information
export const getUserProfile = async (accessToken) => {
  if (!accessToken) {
    throw new Error('No access token provided'); // Throw error if no token
  }

  try {
    // Make a GET request to '/me' to get profile data
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data; // Return profile data
  } catch (error) {
    // Handle specific error status codes
    if (error.response?.status === 401) {
      throw new Error('Access token expired or invalid. Please log in again.');
    }
    throw error; // Throw other errors
  }
};
