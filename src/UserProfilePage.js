import React, { useEffect, useState } from "react";
import axios from "axios";
import { MoreHorizontal } from "lucide-react";
import "./styles/UserProfilePage.css";

const SpotifyProfilePage = ({ accessToken }) => {
  const [profileData, setProfileData] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setError("No access token. Please log in again.");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile data
        const profileResponse = await axios.get(
          "https://api.spotify.com/v1/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        // Fetch user's public playlists count
        const playlistsResponse = await axios.get(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 50 },
          }
        );

        // Fetch user's top tracks
        const topTracksResponse = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 4, time_range: "short_term" },
          }
        );

        setProfileData({
          name: profileResponse.data.display_name,
          profilePic: profileResponse.data.images[0]?.url || "",
          playlistsCount: playlistsResponse.data.total,
          following: profileResponse.data.followers.total,
        });

        setTopTracks(topTracksResponse.data.items);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data. Please try again.");
      }
    };

    fetchData();
  }, [accessToken]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profileData) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="spotify-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-pic-container">
          {profileData.profilePic ? (
            <img
              src={profileData.profilePic}
              alt={`${profileData.name}'s profile`}
              className="profile-pic"
            />
          ) : (
            <div className="profile-pic-placeholder">
              <svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
        <div className="profile-info">
          <span className="profile-label">Profile</span>
          <h1 className="profile-name">{profileData.name}</h1>
          <div className="profile-stats">
            {profileData.playlistsCount} Public Playlists • {profileData.following} Following
          </div>
        </div>
      </div>

      {/* More Options */}
      <div className="more-options">
        <MoreHorizontal size={24} />
      </div>

      {/* Top Tracks Section */}
      <div className="top-tracks-section">
        <div className="section-header">
          <h2>Top tracks this month</h2>
          <button className="show-all">Show all</button>
        </div>
        <div className="visibility-info">Only visible to you</div>

        <div className="tracks-list">
          {topTracks.map((track, index) => (
            <div key={track.id} className="track-item">
              <span className="track-number">{index + 1}</span>
              <img
                src={track.album.images[2]?.url}
                alt={track.album.name}
                className="track-artwork"
              />
              <div className="track-info">
                <div className="track-name">{track.name}</div>
                <div className="track-artist">
                  {track.artists.map(artist => artist.name).join(", ")}
                </div>
              </div>
              <div className="track-album">{track.album.name}</div>
              <div className="track-duration">
                {Math.floor(track.duration_ms / 60000)}:
                {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpotifyProfilePage;
