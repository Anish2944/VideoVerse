import React, { useState } from "react";
import { useGetLikedVideosQuery } from "../../services/LikeNCommentApi";
import VideoCard from "../VideoCard";
import { useGetUserVideosQuery } from "../../services/videoApi";
import { Link } from "react-router-dom";
import { useGetWatchHistoryQuery } from "../../services/userApi";

const TabComponent = ({ isOwner, userId }) => {
  const [activeTab, setActiveTab] = useState("videos");
  const { data: likedvideos, isLoading: likeloading } = useGetLikedVideosQuery();
  const { data: uservideos, isLoading } = useGetUserVideosQuery(userId);
  const {data: watchHistory, isLoading: watchLoading} = useGetWatchHistoryQuery();

  if (isLoading || likeloading || watchLoading) {
    return (
        <div className="flex flex-wrap justify-center gap-1 sm:gap-6">
          <div className="skeleton h-40 w-[30%] min-w-[300px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[300px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[300px]"></div>
        </div>
    )
  }

  return (
    <div >
      <div className="tabs tabs-bordered">
        <button
          className={`tab ${activeTab === "videos" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        {isOwner && (
          <button
            className={`tab ${activeTab === "liked" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            Liked Videos
          </button>
        )}
        {isOwner && (
          <button
            className={`tab ${activeTab === "watch History" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("watch History")}
          >
            Watch History
          </button>
        )}
      </div>
        {/* tab Content */}
      <div className="mt-4">
        {activeTab === "videos" && (
          <div>
            {uservideos?.data?.length > 0 ? (
              <div className="flex flex-wrap justify-center items-center gap-3 p-2 mx-2">
                {uservideos?.data.map((video) => (
                  <VideoCard
                    key={video._id}
                    {...video}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            ) : (
              <div className="text-2xl md:text-2xl md:mx-40 mb-11 text-center font-bold p-8">
                no videos
                {isOwner && <div className="mt-5" >
                    <Link to='/upload-video' >
                        <button className="btn btn-secondary py-0 rounded-badge" > 
                            create video
                        </button>
                    </Link>
                </div>}
              </div>
            )}
          </div>
        )}
        {activeTab === "liked" && isOwner && (
          <div>
            {likedvideos ? (
              <div className="flex flex-wrap justify-center items-center gap-3 p-2 mx-2">
                {likedvideos?.data.map((video) => (
                  <VideoCard
                    key={video.videoDetails._id}
                    {...video.videoDetails}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            ) : (
              <div className="text-2xl md:text-2xl md:mx-40 mb-11 font-bold p-8 text-center">
                no liked videos
              </div>
            )}
          </div>
        )}
        {activeTab === "watch History" && isOwner && 
        <div>
         {watchHistory?.data?.length > 0 ? (
              <div className="flex flex-wrap justify-center items-center gap-4 p-2 mx-2">
                {watchHistory?.data.map((video) => (
                  <VideoCard
                    key={video._id}
                    {...video}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            ) : (
              <div className="text-2xl md:text-2xl md:mx-40 mb-11 font-bold p-8 text-center">
                no watch history videos
              </div>
            )}
        </div>}
      </div>
    </div>
  );
};

export default TabComponent;
