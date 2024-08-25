import React from 'react';
import { Link } from 'react-router-dom';

const PlaylistCard = ({ playlist }) => {

    const thumbnail = playlist.videos.length > 0 ? playlist.videos[0].thumbnail : null;

  return (
    <div className="card bg-base-100 shadow-xl max-w-xs mx-4 my-4">
        {thumbnail && (
        <figure className="px-4 pt-4">
          <img src={thumbnail} alt={playlist.name} className="object-cover w-full h-32" />
        </figure>
      )}
      <div className="card-body p-4">
        <h2 className="card-title text-xl font-semibold">{playlist.name}</h2>
        <p className="text-gray-500">{playlist.description}</p>
        <div className="card-actions justify-end mt-4">
          <Link to={`/playlist/${playlist._id}`} className="btn btn-primary">
            View Playlist
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
