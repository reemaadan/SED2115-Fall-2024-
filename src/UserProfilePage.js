// Import necessary modules and components
import React, { useEffect, useState } from "react";
import axios from "axios"; // For making HTTP requests
import { useNavigate } from "react-router-dom"; // For navigation between routes
import "./styles/UserProfilePage.css"; // Import custom CSS styles

// Define the SpotifyProfilePage component
const SpotifyProfilePage = ({ accessToken }) => {
  // State variables to manage component data and behavior
  const [profileData, setProfileData] = useState(null); // Stores user's profile information
  const [topTracks, setTopTracks] = useState([]); // Stores user's top tracks
  const [error, setError] = useState(null); // Stores any error messages
  const [showAllTracks, setShowAllTracks] = useState(false); // Controls whether to show all tracks or only a few

  const navigate = useNavigate(); // Hook to navigate programmatically

  // useEffect hook to fetch data when the component mounts or when accessToken changes
  useEffect(() => {
    // If there's no access token, set an error message
    if (!accessToken) {
      setError("No access token. Please log in again.");
      return;
    }

    // Asynchronous function to fetch data from the Spotify API
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const profileResponse = await axios.get(
          "https://api.spotify.com/v1/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Include the access token in the request headers
          }
        );

        // Fetch user's public playlists count
        const playlistsResponse = await axios.get(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 50 }, // Limit the number of playlists fetched
          }
        );

        // Fetch user's top tracks (up to 50 tracks)
        const topTracksResponse = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 50, time_range: "short_term" }, // Get top tracks from the last 4 weeks
          }
        );

        // Update state with fetched profile data
        setProfileData({
          name: profileResponse.data.display_name, // User's display name
          profilePic: profileResponse.data.images[0]?.url || "", // User's profile picture URL (if available)
          playlistsCount: playlistsResponse.data.total, // Total number of public playlists
          following: profileResponse.data.followers.total, // Number of followers
        });

        // Update state with fetched top tracks
        setTopTracks(topTracksResponse.data.items);
      } catch (err) {
        // Handle errors by logging and setting an error message
        console.error(err);
        setError("Failed to fetch user data. Please try again.");
      }
    };

    // Call the fetchData function to initiate data fetching
    fetchData();
  }, [accessToken]); // Dependency array ensures this runs when accessToken changes

  // If there's an error, display the error message
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // If profile data hasn't been loaded yet, display a loading message
  if (!profileData) {
    return <div className="loading-message">Loading...</div>;
  }

  // Function to toggle between showing all tracks or only the first few
  const handleShowAllTracks = () => {
    setShowAllTracks((prev) => !prev);
  };

  // Function to navigate back to the previous page
  const handleBack = () => {
    navigate(-1); // Navigate back one step in the history stack
  };

  // Determine which tracks to display based on showAllTracks state
  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, 4);

  // Render the component's UI
  return (
    <div className="spotify-profile">
      {/* Back Button */}
      <button className="back-button" onClick={handleBack}>
        &larr; Back
      </button>

      {/* Profile Header Section */}
      <div className="profile-header">
        <div className="profile-pic-container">
          {profileData.profilePic ? (
            // If the user has a profile picture, display it
            <img
              src={profileData.profilePic}
              alt={`${profileData.name}'s profile`}
              className="profile-pic"
            />
          ) : (
            // If not, display a placeholder icon
            <div className="profile-pic-placeholder">
              <svg
                className="profile-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                {/* SVG paths for the placeholder icon */}
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
        {/* Display user's name and stats */}
        <div className="profile-info">
          <span className="profile-label">Profile</span>
          <h1 className="profile-name">{profileData.name}</h1>
          <div className="profile-stats">
            {/* Show number of public playlists and followers */}
            {profileData.playlistsCount} Public Playlists •{" "}
            {profileData.following} Following
          </div>
        </div>
      </div>

      {/* Top Tracks Section */}
      <div className="top-tracks-section">
        {/* Section header with title and toggle button */}
        <div className="section-header">
          <h2>Your top tracks this month</h2>
          <button className="show-all" onClick={handleShowAllTracks}>
            {/* Button text changes based on showAllTracks state */}
            {showAllTracks ? "Show less" : "Show all"}
          </button>
        </div>
        {/* Header row for the tracks list */}
        <div className="tracks-header">
          <div className="visibility-info">Only visible to you</div>
          <div className="album-header">Album</div>
          <div className="duration-header">Duration</div>
        </div>
        {/* List of top tracks */}
        <div className="tracks-list">
          {displayedTracks.map((track, index) => {
            // Calculate the track's position in the full list
            const trackNumber = topTracks.indexOf(track) + 1;
            return (
              <div key={track.id} className="track-item">
                {/* Display track number */}
                <span className="track-number">{trackNumber}</span>
                {/* Display track artwork */}
                <img
                  src={track.album.images[2]?.url}
                  alt={track.album.name}
                  className="track-artwork"
                />
                {/* Display track name and artist(s) */}
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">
                    {/* Join multiple artist names with commas */}
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </div>
                </div>
                {/* Display album name */}
                <div className="track-album">{track.album.name}</div>
                {/* Display track duration in minutes and seconds */}
                <div className="track-duration">
                  {Math.floor(track.duration_ms / 60000)}:
                  {String(
                    Math.floor((track.duration_ms % 60000) / 1000)
                  ).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export the SpotifyProfilePage component as the default export
export default SpotifyProfilePage;
