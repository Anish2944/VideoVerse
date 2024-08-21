import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetVideoByIdQuery,
  useToggelSubscriptionMutation,
} from "../services/videoApi";
import { useGetChannelProfileQuery } from "../services/userApi";
import { useSelector } from "react-redux";

const StreamingPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetVideoByIdQuery(videoId);
  const [videoData, setVideoData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const currentuser = useSelector((state) => state.auth.user);
  const isOwner = isAuthenticated && currentuser?.data?.username === videoData?.channel;

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };
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
    <div className="flex flex-col items-center text-white min-h-screen p-6">
      {videoData ? (
        <div className="w-full max-w-3xl">
          {/* Video Player */}
          <div className="mb-4">
            <video className="w-full rounded-lg shadow-lg" controls>
              <source src={videoData.videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Channel Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                onClick={avatarClick}
                src={videoData.avatar}
                alt="avatar"
                className="w-16 h-16 cursor-pointer rounded-full border border-gray-600"
              />
              <div className="flex flex-col ml-4">
                <h3 className="text-2xl font-bold">{videoData.title}</h3>
                <p className="text-m">{videoData.channel}</p>
                <p className="text-m">
                  {user?.data?.subscriberCount} Subscriber
                </p>
              </div>
            </div>
            {!isOwner && <button onClick={handleSubs} className="btn btn-primary mt-2">
              {user?.data?.isSubscribed ? "Unsbscribe" : "Subscribe"}
            </button>}
          </div>

          {/* Video Description */}
          <div
            className={`collapse collapse-arrow bg-base-200 ${
              isOpen ? "collapse-open" : ""
            }`}
          >
            <div
              onClick={toggleAccordion}
              className="collapse-title text-xl font-medium cursor-pointer"
            >
              Description
            </div>
            {isOpen && (
              <div className="collapse-content">
                <p>{videoData.description}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6">
          {/* Video Skeleton */}
          <div className="skeleton h-64 w-full"></div>

          {/* Channel Info Skeleton */}
          <div className="flex items-center gap-4 mt-4">
            <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
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
