import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useIncViewsMutation } from '../services/videoApi';

const VideoCard = ({ thumbnail, title, channel, views, avatar, createdAt, _id }) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const [incViews] = useIncViewsMutation();
  const navigate = useNavigate();
  const avatarClick = () => {
    navigate(`/chprofile/${channel}`);
  }
  const thumbnailClick = async () => {
    navigate(`/video/${_id}`);
    await incViews(_id);
  }
  return (
    <div className="card h-fit w-[30%] min-w-[250px] bg-base-100 shadow-xl">
      <figure>
        <img
          onClick={thumbnailClick} 
          src={thumbnail}
          alt="Video Thumbnail" 
          className="w-full cursor-pointer h-48 object-cover"
        />
      </figure>
      <div className="card-body p-4">
        <div className="flex items-start">

          <div className="avatar mr-4">
            <div className="w-12 rounded-full">
              <img 
              onClick={avatarClick}
              src={avatar} 
              className='cursor-pointer' 
              alt="Channel Avatar" />
            </div>
          </div>

          <div>
            <h2 className="card-title text-lg font-bold">
              {title}
            </h2>
            <p className="text-sm text-gray-500">
              {channel}
            </p>
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
