import React from "react";
import { formatDistanceToNow } from "date-fns";
import { RxUpdate } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteVideoByIdMutation, useIncViewsMutation } from "../services/videoApi";
import { CiMenuKebab } from "react-icons/ci";
import { useRemoveVideoFromPlaylistMutation } from "../services/playlistApi";

const VideoCard = ({
  thumbnail,
  title,
  channel,
  views,
  avatar,
  createdAt,
  _id,
  isOwner,
  playlistId
}) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const [deleteVideo, {isLoading}] = useDeleteVideoByIdMutation();

  const [removeFromPlaylist] = useRemoveVideoFromPlaylistMutation();

  const [incViews] = useIncViewsMutation();
  const navigate = useNavigate();
  const avatarClick = () => {
    navigate(`/chprofile/${channel}`);
  };

  const thumbnailClick = async () => {
    navigate(`/video/${_id}`);
    await incViews(_id);
  };

  const handleDelete = async () => {
    await deleteVideo(_id);
  };

  const handleUpdate = () => {
    navigate(`/update-video/${_id}`)
  }

  const handleRemoveVFromPlay = async () => {
    await removeFromPlaylist({playlistId, videoId: _id})
  }

  return (
    <>
    <div className="card h-fit relative w-[40%] min-w-[400px] sm:w-[30%] sm:min-w-[300px] bg-base-200 shadow-xl">
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
                className="cursor-pointer"
                alt="Channel Avatar"
              />
            </div>
          </div>
          <div>
            <h2 className="card-title text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-500">{channel}</p>
            <p className="text-sm text-gray-500">
              {views} views • {timeAgo}
            </p>
          </div>
        </div>
        {isOwner && <div className="dropdown absolute right-1 dropdown-top dropdown-end">
          <div tabIndex={0} role="button" className="btn rounded-full m-1">
            <CiMenuKebab/>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
            <button className="" onClick={handleUpdate} >Update</button>
            </li>
            <li>
              <button className=" text-error" onClick={handleDelete} >Delete</button>
            </li>
          </ul>
        </div>}
        {playlistId && <div className="dropdown absolute right-1 dropdown-top dropdown-end">
          <div tabIndex={0} role="button" className="btn rounded-full m-1">
            <CiMenuKebab/>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
            <button className="text-error" onClick={handleRemoveVFromPlay} >Remove from playlist</button>
            </li>
          </ul>
        </div>}
      </div>
    </div>
      {isLoading && (
          <div
            role="alert"
            className="alert z-20 fixed top-5 w-1/5 alert-error"
          >
            <RxUpdate />
            <span> Deleting video...</span>
          </div>
        )}
  </>
  );
};

export default VideoCard;
