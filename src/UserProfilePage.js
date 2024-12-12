// Importing necessary modules
import React, { useEffect, useState } from "react"; // React's core hooks: useState for state management, useEffect for lifecycle management
import axios from "axios"; // Axios is a library for making HTTP requests
import { useNavigate } from "react-router-dom"; // useNavigate is used to programmatically navigate between routes
import "./styles/UserProfilePage.css"; // Importing custom CSS for styling this component

// SpotifyProfilePage is a React functional component that shows user profile data and top tracks
const SpotifyProfilePage = ({ accessToken }) => {
  // useState hooks to manage various pieces of state in this component
  const [profileData, setProfileData] = useState(null); // Stores Spotify user profile details
  const [topTracks, setTopTracks] = useState([]); // Stores user's top tracks fetched from Spotify
  const [error, setError] = useState(null); // Stores error messages if API calls fail
  const [showAllTracks, setShowAllTracks] = useState(false); // Toggles between showing limited or all top tracks

  const navigate = useNavigate(); // Hook for navigating to different pages

  // useEffect for fetching data
  useEffect(() => {
    // If there's no access token (user not logged in), set an error and stop execution
    if (!accessToken) {
      setError("No access token. Please log in again.");
      return;
    }


    // Asynchronous function to fetch data from the Spotify API
    const fetchData = async () => {
      try {
        // Fetching user profile data from the Spotify API
        const profileResponse = await axios.get(
          "https://api.spotify.com/v1/me", // Spotify API endpoint for user profile
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Authorization header with the user's access token
          }
        );

        // Fetching user's public playlists information
        const playlistsResponse = await axios.get(
          "https://api.spotify.com/v1/me/playlists", // Spotify API endpoint for user's playlists
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Authorization 
            params: { limit: 50 }, // URL query parameters: limit the number of playlists fetched
          }
        );

        // Fetching user's top tracks over the last 4 weeks
        const topTracksResponse = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks", // Spotify API endpoint for top tracks
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Authorization header
            params: { limit: 50, time_range: "short_term" }, // Query parameters for API: fetch 50 tracks from a short time range
          }
        );

        // Updating profile data state with the fetched data
        setProfileData({
          name: profileResponse.data.display_name, // User's display name
          profilePic: profileResponse.data.images[0]?.url || "", // User's profile picture URL or empty string if none
          playlistsCount: playlistsResponse.data.total, // Total number of user's public playlists
          following: profileResponse.data.followers.total, // Number of Spotify followers
        });

        // Updating top tracks state with the fetched data
        setTopTracks(topTracksResponse.data.items);
      } catch (err) {
        // If any of the API calls fail, log the error and set an error message
        console.error(err);
        setError("Failed to fetch user data. Please try again.");
      }
    };



    fetchData(); // Calling the asynchronous function to fetch data
  }, [accessToken]); // Dependency array: useEffect runs again if accessToken changes

  // If there's an error, show an error message on the UI
  if (error) {
    return <div className="error-message">{error}</div>; // .error-message: CSS class for styling error messages
  }

  // While profile data is being fetched, show a loading message
  if (!profileData) {
    return <div className="loading-message">Loading...</div>; // .loading-message: CSS class for styling the loading screen
  }




  // Function to toggle the display of all tracks or just the top 4 tracks
  const handleShowAllTracks = () => {
    setShowAllTracks((prev) => !prev); // Toggles the boolean value of showAllTracks, show alltracks = true, false
  };

  // Function to navigate back to the previous page
  const handleBack = () => {
    navigate(-1); // Navigates one step back in the browser's history
  };

  // Determine which tracks to display based on showAllTracks state
  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, 4); // Defaulting to 4 tracks when 'showAllTracks' is false ensures a concise display for users not interested in scrolling through all tracks.





  // Render the Spotify profile page UI
  return (
    <div className="spotify-profile"> {/* .spotify-profile: CSS class for the main container */}
      {/* Back button to navigate to the previous page */}
      <button className="back-button" onClick={handleBack}> {/* .back-button: CSS class for styling the button */}
        &larr; Back {/* Left arrow to indicate going back */}
      </button>

      {/* Profile header section: displays user's profile picture, name, and stats */}
      <div className="profile-header"> {/* .profile-header: CSS class for the header section */}
        <div className="profile-pic-container"> {/* .profile-pic-container: CSS class for profile picture container */}
          {profileData.profilePic ? (
            <img
              src={profileData.profilePic} // URL of the profile picture
              alt={`${profileData.name}'s profile`} // Alt text for accessibility
              className="profile-pic" // .profile-pic: CSS class for styling the image
            />
          ) : (
            // Placeholder image if the user doesn't have a profile picture
            <div className="profile-pic-placeholder"> {/* .profile-pic-placeholder: CSS class for placeholder */}
              <svg
                className="profile-icon" // .profile-icon: CSS class for the SVG icon
                viewBox="0 0 24 24" // Dimensions of the SVG icon
                fill="none" // No fill color
                stroke="currentColor" // Icon stroke color
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" /> {/* Circle for the user's head in the icon */}
              </svg>
            </div>
          )}
        </div>

        {/* User's name and stats */}
        <div className="profile-info"> {/* .profile-info: CSS class for styling user info */}
          <span className="profile-label">Profile</span> {/* .profile-label: CSS class for "Profile" label */}
          <h1 className="profile-name">{profileData.name}</h1> {/* .profile-name: CSS class for user's display name */}
          <div className="profile-stats"> {/* .profile-stats: CSS class for user stats */}
            {profileData.playlistsCount} Public Playlists • {/* Total playlists */}
            {profileData.following} Following {/* Number of followers */}
          </div>
        </div>
      </div>




// CJS TOP TRACKS
      

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
