import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ChartComponent from "./components/chart_component";
import TopTracksList from './components/TopTracksList';
import InteractiveArtistRankings from "./components/InteractiveArtistRankings";
import SpotifyProfilePage from "./UserProfilePage";
import {
  getAuthUrl,
  validateToken,
  fetchUserTopArtists,
  fetchUserTopTracks,
  getTokenFromUrl,
} from "./components/auth/spotify_service";
import "./styles/LoginPage.css"

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
console.log('Client ID:', process.env.REACT_APP_CLIENT_ID);

function App() {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState({ topArtists: null, topTracks: null });
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (accessToken) => {
    setError(null);
    try {
      const [artistsData, tracksData] = await Promise.all([
        fetchUserTopArtists(accessToken),
        fetchUserTopTracks(accessToken)
      ]);
      setUserData({ topArtists: artistsData, topTracks: tracksData });
    } catch (err) {
      setError(err.message || "Failed to load user data");
      setToken(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getTokenFromUrl();
        console.log("Access Token:", accessToken);
        if (accessToken) {
          const isValid = await validateToken(accessToken);
          if (isValid) {
            setToken(accessToken);
            localStorage.setItem("spotify_access_token", accessToken);
          } else {
            setError("Invalid access token received");
          }
        } else {
          const storedToken = localStorage.getItem("spotify_access_token");
          if (storedToken) {
            const isValid = await validateToken(storedToken);
            if (isValid) {
              setToken(storedToken);
            } else {
              localStorage.removeItem("spotify_access_token");
            }
          }
        }
      } catch (err) {
        setError("Failed to initialize authentication");
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  const handleLogin = () => {
    window.location.href = getAuthUrl(CLIENT_ID);
  };

  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token");
    setToken(null);
    setUserData({ topArtists: null, topTracks: null });
  };

  const handleArtistClick = (artistData) => {
    setSelectedArtist(artistData);
  };

  const handleTrackClick = (trackData) => {
    console.log('Track clicked:', trackData);
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  if (isLoading) {
    return (
      <div className="container">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          {error}
        </div>
        <button
          onClick={handleLogin}
          className="login-button"
        >
          Login Again
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              {!token && (
                <button
                  onClick={handleLogin}
                  className="login-button"
                >
                  Login with Spotify
                </button>
              )}
              
              {userData.topArtists && (
                <div className="content-wrapper">
                  <div className="header">
                    <div>
                      <h1 className="title">Data Spot</h1>
                      <p className="description">
                        Welcome to Data Spot, where you can see all the data
                        from your favorite artists and tracks
                      </p>
                    </div>
                    {token && (
                      <button
                        onClick={handleLogout}
                        className="logout-button"
                      >
                        Logout
                      </button>
                    )}
                  </div>

                  <h2 className="section-title">Your Top Artists</h2>

                  <div className="chart-container">
                    <div className="chart-wrapper">
                      <h3 className="chart-title">Artist Popularity Chart</h3>
                      <ChartComponent 
                        data={userData.topArtists}
                        onItemClick={handleArtistClick}
                        type="artist"
                      />
                    </div>
                  </div>

                  {userData.topTracks && (
                    <div className="tracks-section">
                      <h2 className="section-title">Your Top Tracks</h2>
                      <TopTracksList
                        data={userData.topTracks}
                        onTrackClick={handleTrackClick}
                      />
                    </div>
                  )}

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
          }
        />
        
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

export default App;