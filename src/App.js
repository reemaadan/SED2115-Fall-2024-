// Import necessary libraries and components
import React, { useState, useEffect } from "react"; // React and hooks for state management
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Routing for single-page applications

import introJs from 'intro.js'; // Import Intro.js for the interactive tutorial
import 'intro.js/introjs.css'; // Import Intro.js styles

import './styles/App.css'; // Import custom styles

// Import custom components
import ChartComponent from "./components/chart_component"; // Chart to display top artists
import TopTracksList from './components/TopTracksList'; // List to display top tracks
import SpotifyProfilePage from "./UserProfilePage"; // User profile page component

// Import Spotify authentication and data fetching functions
import {
  getAuthUrl,
  validateToken,
  fetchUserTopArtists,
  fetchUserTopTracks,
  getTokenFromUrl,
} from "./components/auth/spotify_service";

// Note: The following imports may not be necessary unless used elsewhere in your code
// import { color } from "chart.js/helpers";
// import { toBePartiallyChecked } from "@testing-library/jest-dom/matchers";

// Retrieve the Spotify Client ID from environment variables
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
console.log('Client ID:', process.env.REACT_APP_CLIENT_ID);

// Define the main App component
function App() {
  // State variables using React hooks
  const [token, setToken] = useState(null); // Spotify access token
  const [userData, setUserData] = useState({ topArtists: null, topTracks: null }); // User's top artists and tracks
  const [error, setError] = useState(null); // Error message
  const [selectedArtist, setSelectedArtist] = useState(null); // Currently selected artist (if any)
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [activeTab, setActiveTab] = useState('artists'); // Active tab ('artists' or 'tracks')

  // Define the steps for the Intro.js tutorial
  const steps = [
    {
      element: '.tabs', // CSS selector for the tabs element
      intro: 'Use these tabs to switch between your Top Artists and Top Tracks.', // Tutorial text
      position: 'bottom' // Position of the tooltip
    },
    {
      element: '.chart-section', // Selector for the chart section
      intro: 'This chart displays how popular your top artists are among other users.',
      position: 'top'
    },
    {
      element: '.tab-button.active', // Corrected selector for the active tab button
      intro: 'This is the list of your Top Tracks.',
      position: 'top'
    },
    {
      element: '.profile-button', // Selector for the profile button
      intro: 'Use this button to log into your profile.',
      position: 'top'
    },
  ];

  // Function to start the Intro.js tutorial
  const startTutorial = () => {
    introJs()
      .setOptions({ steps }) // Set the tutorial steps
      .start(); // Start the tutorial
  };

  // Function to load user data (top artists and tracks)
  const loadUserData = async (accessToken) => {
    setError(null); // Reset any existing errors
    try {
      // Fetch top artists and tracks simultaneously
      const [artistsData, tracksData] = await Promise.all([
        fetchUserTopArtists(accessToken),
        fetchUserTopTracks(accessToken)
      ]);
      // Update state with fetched data
      setUserData({ topArtists: artistsData, topTracks: tracksData });
    } catch (err) {
      // Handle errors
      setError(err.message || "Failed to load user data");
      setToken(null); // Reset token on error
    }
  };

  // useEffect hook to initialize authentication when the component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getTokenFromUrl(); // Retrieve token from URL after Spotify redirect
        console.log("Access Token:", accessToken);
        if (accessToken) {
          // Validate the access token
          const isValid = await validateToken(accessToken);
          if (isValid) {
            setToken(accessToken); // Set the token in state
            localStorage.setItem("spotify_access_token", accessToken); // Save token in local storage
          } else {
            setError("Invalid access token received");
          }
        } else {
          // Check for token in local storage if not in URL
          const storedToken = localStorage.getItem("spotify_access_token");
          if (storedToken) {
            const isValid = await validateToken(storedToken);
            if (isValid) {
              setToken(storedToken); // Use the stored token
            } else {
              localStorage.removeItem("spotify_access_token"); // Remove invalid token
            }
          }
        }
      } catch (err) {
        // Handle initialization errors
        setError("Failed to initialize authentication");
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false); // Loading is complete
      }
    };

    initializeAuth(); // Call the authentication function
  }, []); // Empty dependency array means this runs once on component mount

  // useEffect hook to load user data when the token changes
  useEffect(() => {
    if (token) {
      loadUserData(token); // Load data using the valid token
    }
  }, [token]); // Dependency on 'token' state variable

  // Function to handle user login
  const handleLogin = () => {
    window.location.href = getAuthUrl(CLIENT_ID); // Redirect to Spotify's authentication page
  };

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token"); // Remove token from local storage
    setToken(null); // Reset token state
    setUserData({ topArtists: null, topTracks: null }); // Clear user data
  };

  // Function to handle artist click events
  const handleArtistClick = (artistData) => {
    setSelectedArtist(artistData); // Update selected artist state
    // Additional logic can be added here
  };

  // Function to handle track click events
  const handleTrackClick = (trackData) => {
    console.log('Track clicked:', trackData);
    // Additional logic can be added here
  };

  // Component to protect routes that require authentication
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      // If no token, redirect to home page
      return <Navigate to="/" replace />;
    }
    // If authenticated, render the child components
    return children;
  };

  // Render loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  // Render error message if there's an error
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          {error}
        </div>
        {/* Provide a login button to retry authentication */}
        <button
          onClick={handleLogin}
          className="login-button"
        >
          Login Again
        </button>
      </div>
    );
  }

  // Main component rendering
  return (
    <Router>
      <Routes>
        {/* Define the main route */}
        <Route
          path="/"
          element={
            <div className="page-container">
              {/* Header section */}
              <header className="header">
                <div>
                  <h1 className="title">DataSpot</h1>
                  <p className="description">
                    Welcome to DataSpot, where you can see all the data
                    from your favorite artists and tracks.
                  </p>
                </div>
                {/* Logout button, shown only when user is authenticated */}
                {token && (
                  <button
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
                )}
              </header>

              {/* Start Tutorial Button, shown only when user is authenticated */}
              {token && (
                <button onClick={startTutorial} className="tutorial-button">
                  Help
                </button>
              )}

              {/* Main Content Area */}
              <div className="content-container">
                {/* If user is not authenticated, show login button */}
                {!token && (
                  <button
                    onClick={handleLogin}
                    className="login-button"
                  >
                    Login with Spotify
                  </button>
                )}

                {/* If user data is available, display the content */}
                {userData.topArtists && userData.topTracks && (
                  <div className="main-content">
                    {/* Tabs for switching between Top Artists and Top Tracks */}
                    <div className="tabs">
                      <button
                        className={`tab-button ${activeTab === 'artists' ? 'active' : ''}`}
                        onClick={() => setActiveTab('artists')} // Set active tab to 'artists'
                      >
                        Top Artists
                      </button>
                      <button
                        className={`tab-button ${activeTab === 'tracks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tracks')} // Set active tab to 'tracks'
                      >
                        Top Tracks
                      </button>
                    </div>

                    {/* Conditionally render content based on active tab */}
                    {activeTab === 'artists' && (
                      <div className="chart-section">
                        <h2 className="section-title">Your Top Artists</h2>
                        {/* Render the chart component with top artists data */}
                        <ChartComponent 
                          data={userData.topArtists}
                          onItemClick={handleArtistClick}
                          type="artist"
                        />
                      </div>
                    )}

                    {activeTab === 'tracks' && (
                      <div className="tracks-section">
                        <h2 className="section-title">Your Top Tracks</h2>
                        {/* Render the top tracks list component */}
                        <TopTracksList
                          data={userData.topTracks}
                          onTrackClick={handleTrackClick}
                        />
                      </div>
                    )}

                    {/* Button to view user profile */}
                    {token && (
                      <button
                        onClick={() => (window.location.href = "/profile")}
                        className="profile-button"
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          }
        />

        {/* Protected route for the profile page */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <SpotifyProfilePage accessToken={token} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Export the App component as default
export default App;

