import axios from 'axios'; // Import axios to handle HTTP requests
console.log("the import from axios is workin' good")
// Replace 'your-client-id' with your Spotify application's client ID
const clientId = 'your-client-id';
console.log("the clientID fetch initiated")
// Redirect URI that Spotify will send the user back to after login (must match the one set in Spotify Dashboard)
const redirectUri = 'http://localhost:3000/callback';

// Scopes define the permissions you're requesting from the user. Here, we request access to the user's top artists.
const scopes = 'user-top-read';

/**
 * Generates the URL where the user will be sent to log in to Spotify and authorize your app.
 * @returns {string} The authorization URL
 */
export const getAuthUrl = () => {
  // Construct the Spotify authorization URL with required parameters like client ID, redirect URI, and scopes
  return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`;
};
console.log("spotify redirect worked")
/**
 * Fetches the top artists for the logged-in user from the Spotify API using the access token.
 * @param {string} accessToken The Spotify access token obtained after login
 * @returns {Promise} A promise that resolves to the user's top artists
 */
export const fetchUserData = (accessToken) => {
  // Make an HTTP GET request to the Spotify API to fetch the user's top artists, including the token in the headers
  return axios.get('https://api.spotify.com/v1/me/top/artists', {
    headers: {
      Authorization: `Bearer ${accessToken}` // Bearer token authorization format
    }
  });
};
