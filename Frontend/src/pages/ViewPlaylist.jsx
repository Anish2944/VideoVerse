import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetPlaylistByIdQuery, useUpdatePlaylistMutation } from '../services/playlistApi';
import VideoCard from '../components/VideoCard';

const ViewPlaylist = () => {
  const { playlistId } = useParams();
  const { data, isLoading, error } = useGetPlaylistByIdQuery(playlistId);
  const [updatePlaylist] = useUpdatePlaylistMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");


  const handleEditClick = () => {
    setIsEditing(true);
    setName(data?.data?.name || "");
    setDescription(data?.data?.description || "");
  };

  const handleSaveClick = async () => {
    try {
      await updatePlaylist({ playlistId, name, description });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="sm:p-10 p-0 m-0 sm:mx-10">
        {/* Skeleton Loader */}
        <div className="mb-8">
          <div className="h-8 w-40 bg-base-300 animate-pulse mb-4"></div>
          <div className="h-4 w-60 bg-base-300 animate-pulse"></div>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="skeleton w-[30%] min-w-[250px] h-40 bg-base-300 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div>Error fetching playlist: {error.message}</div>;

  return (
    <div className="p-4 sm:mx-20 mx-2 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl input input-bordered font-bold border p-2 rounded"
          />
        ) : (
          <h1 className="text-2xl font-bold">{data?.data?.name}</h1>
        )}
        <button
          className={`btn btn-sm ${isEditing ? 'btn-success' : 'btn-secondary'} m-1 btn-outline`}
          onClick={isEditing ? handleSaveClick : handleEditClick}
        >
          {isEditing ? "Save" : "Edit Playlist"}
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full textarea textarea-bordered border p-2 rounded mb-8"
          rows="4"
        />
      ) : data?.data?.description ? (
        <p className="mb-8 bg-base-200 p-5 rounded-xl">{data?.data?.description}</p>
      ) : (
        <button className="btn btn-secondary mb-8" onClick={handleEditClick}>
          Add Description
        </button>
      )}

      <div className="flex flex-wrap sm:justify-start justify-center items-center gap-6">
        {data?.data?.videos?.map((video) => (
          <VideoCard key={video._id} {...video} playlistId={playlistId} />
        ))}
      </div>
    </div>
  );
};

export default ViewPlaylist;
