// TopTracksList.js

// Import React library to use JSX and React components
import React from 'react';

// Import the CSS styles specific to this component
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
        {/* Loop over each track in the data.items array */}
        {data.items.map((track, index) => (
          <li
            key={track.id} // Unique key for each list item (required by React)
            className="track-item"
            onClick={() => onTrackClick(track)} // Call onTrackClick when the item is clicked
          >
            {/* Display the track's position in the list */}
            <span className="track-index">{index + 1}</span>
            {/* Display the album artwork */}
            <img
              className="track-image"
              src={track.album.images[0]?.url} // Use the first image in the album images array
              alt={track.name} // Alt text for accessibility
            />
            {/* Display track information: name and artists */}
            <div className="track-info">
              <p className="track-name">{track.name}</p>
              <p className="track-artists">
                {/* Join multiple artist names with commas */}
                {track.artists.map(artist => artist.name).join(', ')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Export the component to be used in other parts of the application
export default TopTracksList;

