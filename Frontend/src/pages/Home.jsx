import React from "react";
import { useSelector } from "react-redux";
import VideoCard from "../components/VideoCard";
import { useGetAllVideosQuery } from "../services/videoApi";

const Home = () => {
  const { data, isLoading, error } = useGetAllVideosQuery(); 

  console.log(data);
  console.log('Is Loading:', isLoading); // Debugging line
  console.log('Error:', error);
  return (
    <div className="p-10 mx-10">
      {isLoading ? (
        <div className="flex flex-wrap justify-center gap-6">
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          <div className="skeleton h-40 w-[30%] min-w-[250px]"></div>
        </div>
      ) : (
        <>
        {data?.data?.videos?.length > 0 ? (
          <div className='flex flex-wrap justify-center gap-6'>
            {data?.data?.videos?.map((video) => (
              <VideoCard
              key={video._id}
              thumbnail={video.thumbnail}
              title={video.title}
              channel={video.channel}
              views={video.views}
              owner={video.owner}
              avatar={video.avatar}
              createdAt={video.createdAt} />
            ))}
          </div>
        ) : (
          <h1 className=" text-4xl md:text-4xl md:mx-40 mb-11 font-bold p-8 text-gray-700 >No Posts Found"></h1>
        )}
      </>
      )}
    </div>
  );
};

export default Home;
