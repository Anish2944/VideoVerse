import React from 'react';


import PlaylistCard from '../components/PlaylistComponents/PlaylistCard';
import { useSelector } from 'react-redux';
import { useGetUserPlaylistsQuery } from '../services/playlistApi'

const Playlists = () => {

  const userId = useSelector(state => state.auth.user.data._id)

  const { data, isLoading, error } = useGetUserPlaylistsQuery(userId);

  if (isLoading) {
    return (
      <div className="sm:p-10 p-0 m-0 sm:mx-10">
        {/* Skeleton Loader */}
        <div className="flex flex-wrap items-start justify-center gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="skeleton w-[30%] min-w-[250px] h-40 bg-base-300 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div>Error fetching playlists: {error.message}</div>;

  return (
    <>
    <div className='p-4 sm:mx-20 mx-2 sm:p-8'>
      <h1 className='font-bold text-3xl' >All Playlists</h1>
    </div>
      <div className="flex sm:mx-20 mx-2 sm:p-8 flex-wrap sm:justify-start justify-center gap-6">
        {data?.data?.map((playlist) => (
          <PlaylistCard key={playlist._id} playlist={playlist} />
        ))}
      </div>
    </>
  );
};

export default Playlists;
