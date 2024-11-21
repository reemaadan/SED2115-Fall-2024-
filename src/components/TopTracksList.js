// TopTracksList.js

import React from 'react';

/**
 * TopTracksList renders a list of the user's top tracks.
 * @param {object} data - The top tracks data fetched from Spotify.
 * @param {function} onTrackClick - Callback function when a track is clicked.
 */
const TopTracksList = ({ data, onTrackClick }) => {
  return (
    <div className="top-tracks-list">
      <ul className="divide-y divide-gray-200">
        {data.items.map((track, index) => (
          <li
            key={track.id}
            className="py-4 flex items-center cursor-pointer hover:bg-gray-100"
            onClick={() => onTrackClick(track)}
          >
            <span className="w-10 text-center">{index + 1}</span>
            <img
className="w-[10px] h-[10px] rounded-md object-cover mr-4"  src={track.album.images[0]?.url}
  alt={track.name}
/>
            <div>
              <p className="text-lg font-medium">{track.name}</p>
              <p className="text-sm text-gray-500">
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

