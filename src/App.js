// Importing React and specific hooks (useState and useEffect) from the React library
import React, { useState, useEffect } from 'react';

// Importing the ChartComponent, which will display data in a chart (we’ll use this later)
import ChartComponent from './chart_component';

// Importing helper functions from a separate file (spotify_service)
// These functions help with Spotify-specific tasks like getting the login URL, validating tokens, and fetching data
import { getAuthUrl, validateToken, fetchUserTopArtists } from './spotify_service';

// Setting up the Spotify application's unique Client ID
// This Client ID is provided by Spotify and identifies the app when making API requests
const CLIENT_ID = '6f0680f2317545fd8d2a7bd3263b4d51';

// Main component function for the app
function App() {
  // Setting up a state variable for the token
  // `token` will store the Spotify access token, which is used to access the user’s data
  // `setToken` is a function we can call to update the `token` variable
  const [token, setToken] = useState(null); // Starts as `null` because we don’t have a token initially

  // Setting up a state variable for storing user data (like their top artists)
  // `userData` holds this data, while `setUserData` is the function to update it
  const [userData, setUserData] = useState(null); // Initially, there's no data, so we set it to `null`

  // State for handling errors
  // `error` stores any error message, and `setError` lets us update it when an error occurs
  const [error, setError] = useState(null); // No error at first, so it’s set to `null`

  /**
   * This function loads user data by calling Spotify’s API to get the top artists
   * @param {string} accessToken - The Spotify access token (required to get user data)
   */
  const loadUserData = async (accessToken) => {
    // When we start loading, clear any previous errors (if any)
    setIsLoading(true); // Set loading to true to show the user it’s loading (needs `setIsLoading` state)
    setError(null); // Clear any old error message from previous attempts
    
    try {
      // Calls the `fetchUserTopArtists` function to get the user’s top artists
      // `await` pauses this line until the data is fetched
      const data = await fetchUserTopArtists(accessToken); // Data now holds the user's top artist info
      
      // If data is successfully retrieved, store it in `userData` state
      setUserData(data);
    } catch (err) {
      // If there’s an error (like an invalid token), catch it here
      // Update `error` state with the error message or a default message
      setError(err.message || 'Failed to load user data');
      
      // Clear the token because it may be invalid
      setToken(null); 
    } 
  };

  // `useEffect` runs specific code at certain times (called a "side effect")
  // This effect checks if there’s a token in the URL when the app first loads (only runs once)
  useEffect(() => {
    const getTokenFromUrl = async () => {
      // Gets everything in the URL after `#`, where Spotify puts the token after login
      const hash = window.location.hash;
      if (!hash) return; // If no hash is found, stop here

      // Parsing the hash to extract the access token
      const params = new URLSearchParams(hash.substring(1)); // This splits out the token from the rest
      const accessToken = params.get('access_token'); // Retrieves the token itself
      
      // If we got a token, validate it to make sure it's good
      if (accessToken) {
        // Calls `validateToken` to check if token works
        const isValid = await validateToken(accessToken);
        
        if (isValid) {
          // If valid, store it in `token` state
          setToken(accessToken);
        } else {
          // If invalid, set an error message
          setError('Invalid access token received');
        }
      }
    };

    // Call the function to start checking the token in the URL
    getTokenFromUrl();
  }, []); // Empty array here means `useEffect` only runs once (when the component mounts)

  // Another `useEffect` that depends on `token` (it runs each time `token` changes)
  useEffect(() => {
    // If we have a valid token, load the user's top artists
    if (token) {
      loadUserData(token);
    }
  }, [token]); // `[token]` means this code runs whenever `token` changes

  /**
   * Redirects the user to Spotify’s login page when they click the login button
   * This starts the authentication process by taking them to Spotify’s login
   */
  const handleLogin = () => {
    // `window.location.href` is set to Spotify’s login URL so the user is taken there
    window.location.href = getAuthUrl(CLIENT_ID);
  };

  // If an error occurred, show an error message and a button to retry login
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error} {/* Displays the actual error message */}
        </div>
        <button 
          onClick={handleLogin} // Button to re-login if there's an error
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
        >
          Login Again
        </button>
      </div>
    );
  }

  // Main section of the app to show either the login button or user data
  return (
    <div className="container mx-auto p-4">
      {/* Show login button if user is not logged in (no token) */}
      {!token && (
        <button 
          onClick={handleLogin} // Calls `handleLogin` when clicked
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
        >
          Login with Spotify {/* Button text */}
        </button>
      )}

      {/* If `userData` is available, show the chart and welcome text */}
      {userData && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-2">Data Spot</h1>
          <p className="mb-6">
            Welcome to Data Spot, where you can see all the data from your favorite artists
          </p>
          <h2 className="text-2xl font-semibold mb-4">Your Top Artists</h2>
          <ChartComponent userData={userData} /> {/* Passes `userData` to `ChartComponent` to display */}
        </div>
      )}
    </div>
  );
}

