import React, { useContext, useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import { useGetAllVideosQuery } from "../services/videoApi";
import { SearchContext } from "../context/SearchContext";
import { useInView } from 'react-intersection-observer'

const Home = () => {

  const { searchQuery } = useContext(SearchContext);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, isFetching } = useGetAllVideosQuery(
    {page, limit: 9, query: searchQuery},
    ); 

    const { ref: loadMoreRef, inView } = useInView({
      threshold: 1,
      triggerOnce: false
    });
  
    useEffect(() => {
      if (inView && data && page < data?.data?.totalPage) {
        setPage(prevPage => prevPage + 1);
      }
    }, [inView, data]);

    useEffect(() => {
      setPage(1);
    },[searchQuery])

  
if (error) {
  console.error(error)
  return (
    <div>
      <h1>Error: {error.message}</h1>
      <p className="text-error font-bold text-xl" >Try to Re-login</p>
    </div>
  )
}


  return (
    <div className="sm:p-10 p-0 mt-3 sm:m-0 sm:mx-10">
      {(isLoading && page === 1 || isFetching) ? (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="skeleton h-40 w-[30%] min-w-[250px]"></div>
          ))}
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
          <h1 className=" text-4xl md:text-4xl md:mx-40 mb-11 font-bold p-8 text-center">
             No videos Found
          </h1>
        )}
        {!isLoading && !isFetching && data?.data?.videos?.length > 0 && (
            <div ref={loadMoreRef}></div>
          )}
      </>
      )}
    </div>
  );
};

export default Home;
