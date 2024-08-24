import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetVideoByIdQuery,
  useSetWatchHistoryMutation,
  useToggelSubscriptionMutation,
} from "../services/videoApi";
import { useGetChannelProfileQuery } from "../services/userApi";
import { useSelector } from "react-redux";
import LikeShareButtons from "../components/videoComponents/LikeNShareBtn";
import CommentSection from "../components/videoComponents/CommentSection";

const StreamingPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetVideoByIdQuery(videoId);
  const [videoData, setVideoData] = useState(null);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const currentuser = useSelector((state) => state.auth.user);
  const isOwner =
    isAuthenticated && currentuser?.data?.username === videoData?.channel;

  const avatarClick = () => {
    navigate(`/chprofile/${videoData?.channel}`);
  };
  const { data: user, refetch } = useGetChannelProfileQuery(
    videoData?.channel,
    {
      skip: !videoData?.channel,
    }
  );
  const [toggelSubs] = useToggelSubscriptionMutation();
  const [setWatchHistory] = useSetWatchHistoryMutation();

  useEffect(() => {
    const addToWatchHistory = async () => {
      try {
        await setWatchHistory(videoId);
      } catch (error) {
        console.error("Failed to set watch history:", error);
      }
    };
  
    addToWatchHistory();
  }, [videoId]);
  

  const handleSubs = async () => {
    await toggelSubs(videoData?.owner);
    refetch();
  };

  useEffect(() => {
    if (data && data.success) {
      setVideoData(data.data);
    }
  }, [data]);

  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="flex flex-col bg-base-100 items-center min-h-screen p-4 md:p-6 lg:p-8">
      {videoData ? (
        <div className="w-full max-w-3xl rounded-lg bg-base-200 lg:max-w-5xl">
          {/* Video Player */}
          <div className="mb-4">
            <video className="w-full rounded-lg shadow-lg" controls>
              <source src={videoData.videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Channel Info */}
          <div className="flex px-5 flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  onClick={avatarClick}
                  src={videoData.avatar}
                  alt="avatar"
                  className="w-12 h-12 md:w-16 md:h-16 cursor-pointer rounded-full border border-gray-600"
                />
                <div className="flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold">{videoData.title}</h3>
                  <p className="text-sm text-gray-500">{videoData.channel}</p>
                  <p className="text-sm text-gray-500">
                    {user?.data?.subscriberCount} Subscriber
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <LikeShareButtons videoId={videoId} />
                {!isOwner && (
                  <button
                    onClick={handleSubs}
                    className={`btn ${
                      user?.data?.isSubscribed ? "btn-outline btn-error" : "btn-primary"
                    }`}
                  >
                    {user?.data?.isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Video Description */}
          <div className="mt-5 px-5">
            <div className="collapse collapse-arrow bg-base-300">
              <input type="checkbox" />
              <div className="collapse-title text-lg md:text-xl font-medium">Description</div>
              <div className="collapse-content">
                <p>{videoData?.description}</p>
              </div>
            </div>
          </div>
          <CommentSection videoId={videoId} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Video Skeleton */}
          <div className="skeleton h-64 w-full"></div>

          {/* Channel Info Skeleton */}
          <div className="flex items-center gap-4 mt-4">
            <div className="skeleton h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-full"></div>
            <div className="flex flex-col gap-2">
              <div className="skeleton h-4 w-32"></div>
              <div className="skeleton h-4 w-24"></div>
            </div>
            <div className="ml-auto">
              <div className="skeleton h-8 w-24"></div>
            </div>
          </div>

          {/* Video Description Skeleton */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-3/4"></div>
            <div className="skeleton h-4 w-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingPage;
