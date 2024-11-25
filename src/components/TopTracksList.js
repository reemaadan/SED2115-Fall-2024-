// TopTracksList.js

import React from 'react';
import '../styles/TopTracksList.css';

/**
 * TopTracksList renders a list of the user's top tracks.
 * @param {object} data - The top tracks data fetched from Spotify.
 * @param {function} onTrackClick - Callback function when a track is clicked.
 */
const TopTracksList = ({ data, onTrackClick }) => {
  return (
    <div className="top-tracks-list">
      <ul className="tracks-list">
        {data.items.map((track, index) => (
          <li
            key={track.id}
            className="track-item"
            onClick={() => onTrackClick(track)}
          >
            <span className="track-index">{index + 1}</span>
            <img
              className="track-image"
              src={track.album.images[0]?.url}
              alt={track.name}
            />
            <div className="track-info">
              <p className="track-name">{track.name}</p>
              <p className="track-artists">
                {track.artists.map(artist => artist.name).join(', ')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopTracksList;
