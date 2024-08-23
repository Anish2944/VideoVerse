import React from "react";
import VideoCard from "../components/VideoCard";
import { useGetAllVideosQuery } from "../services/videoApi";

const Home = () => {
  const { data, isLoading, error } = useGetAllVideosQuery(); 

  // console.log(data);
  // console.log('Is Loading:', isLoading); // Debugging line
  // console.log('Error:', error);
  return (
    <div className="sm:p-10 p-0 m-0 sm:mx-10">
      {isLoading ? (
        <div className="flex flex-wrap justify-center gap-1 sm:gap-6">
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
          <div className='flex flex-wrap items-start justify-center gap-6'>
            {data?.data?.videos?.map((video) => (
              <VideoCard
              key={video._id}
              {...video} />
            ))}
          </div>
        ) : (
          <h1 className=" text-4xl md:text-4xl md:mx-40 mb-11 font-bold p-8 text-center">You Must Login to use this App</h1>
        )}
      </>
      )}
    </div>
  );
};

export default Home;
