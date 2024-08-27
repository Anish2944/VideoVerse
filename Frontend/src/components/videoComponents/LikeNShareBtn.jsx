import React, { useState } from "react";
import { FaThumbsUp, FaShareAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import {
  useGetNLikesOnVideoByIdQuery,
  useToggelLikeOnVideoMutation,
} from "../../services/LikeNCommentApi";
import { useSelector } from "react-redux";

const LikeShareButtons = ({ videoId }) => {
  const [Alert, setAlert] = useState(false);
  const currentUsername = useSelector((state) => state.auth.user.username);
  const { data: likes } = useGetNLikesOnVideoByIdQuery(videoId);

  const userExists =
    likes?.data?.likedBy && Array.isArray(likes.data.likedBy)
      ? likes.data.likedBy.some(
          (like) => like.likeBy.username === currentUsername
        )
      : false;

  const [toggelLike] = useToggelLikeOnVideoMutation();

  const handleLike = async () => {
    await toggelLike(videoId);
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Check if the Web Share API is supported
        await navigator.share({
          title: "Check out this video",
          text: "I found this video interesting. You should watch it!",
          url: window.location.href, // Current URL
        });
        setAlert(true);
      } else {
        // Fallback if Web Share API is not supported
        alert("Web Share API is not supported in your browser.");
      }
    } catch (error) {
      console.error("Error sharing", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button onClick={handleLike} className=" flex items-center gap-2">
        <FaThumbsUp className={`${userExists ? "text-primary" : ""}`} /> Like{" "}
        {likes?.data?.NoOfLikesOnVideo > 0 && (
          <span>{likes?.data?.NoOfLikesOnVideo}</span>
        )}
      </button>

      <button onClick={handleShare} className=" flex items-center gap-2">
        <FaShareAlt /> Share
      </button>
      {Alert && (
        <div
        role="alert"
        className="alert alert-success w-11/12 max-w-md z-20 absolute right-2 top-20 sm:right-4 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/5"
      >
        <SiTicktick />
        <span className="ml-2">Thanks for sharing!</span>
        <div>
          <button
            onClick={() => setAlert(false)}
            className="btn btn-sm btn-ghost"
          >
            X
          </button>
        </div>
      </div>
      
      )}
    </div>
  );
};

export default LikeShareButtons;
