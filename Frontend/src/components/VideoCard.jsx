import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ thumbnail, title, channel, views, avatar, createdAt }) => {
  // Format the createdAt date
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="card h-fit w-[30%] min-w-[250px] bg-base-100 shadow-xl">
      {/* Thumbnail */}
      <figure>
        <img 
          src={thumbnail}
          alt="Video Thumbnail" 
          className="w-full h-48 object-cover"
        />
      </figure>
      
      {/* Video Details */}
      <div className="card-body p-4">
        <div className="flex items-start">
          {/* Channel Avatar */}
          <div className="avatar mr-4">
            <div className="w-12 rounded-full">
              <img src={avatar} alt="Channel Avatar" />
            </div>
          </div>
          
          {/* Title and Channel Info */}
          <div>
            {/* Video Title */}
            <h2 className="card-title text-lg font-bold">
              {title}
            </h2>
            {/* Channel Name */}
            <p className="text-sm text-gray-500">
              {channel}
            </p>
            {/* Views and Time Ago */}
            <p className="text-sm text-gray-500">
              {views} views • {timeAgo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
