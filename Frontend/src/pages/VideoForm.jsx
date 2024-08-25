import React, { useState, useEffect } from "react";
import { SiTicktick } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx";
import { useForm } from "react-hook-form";
import { useGetVideoByIdQuery, useUpdateVideoByIdMutation, useUploadVideoMutation } from "../services/videoApi";
import { useNavigate } from "react-router-dom";

const VideoForm = ({ videoId }) => {

  const {data: video, isLoading: loading} = useGetVideoByIdQuery(videoId);
  const isUpdateMode = Boolean(video); //If video data available update mode will be on


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [uploadVideo, { isLoading, error, isSuccess }] =
    useUploadVideoMutation();
  const [updateVideo, {isLoading: updating, isSuccess: updated}] = useUpdateVideoByIdMutation();
  const navigate = useNavigate();
  const [serverErr,setServerErr] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      if (isUpdateMode) {

        if (data.videoFile && data.videoFile.length > 0) {
          formData.append("videoFile", data.videoFile[0]);
        }
  
        if (data.thumbnail && data.thumbnail.length > 0) {
          formData.append("thumbnail", data.thumbnail[0]);
        }
        formData.append("title", data.title);
        formData.append("description", data.description);

        const response = await updateVideo({videoId, videoData: formData}).unwrap();
        console.log(response)
        if (response.success) {
          setUploadedVideoId(response?.data?._id); // Store the uploaded video ID
          setUploadSuccess(true);
        }
        
      } else {
        formData.append("videoFile", data.videoFile[0]);
        formData.append("thumbnail", data.thumbnail[0]);
        formData.append("title", data.title);
        formData.append("description", data.description);
  
        const response = await uploadVideo(formData).unwrap();
        if (response.success) {
          setUploadedVideoId(response?.data?._id); // Store the uploaded video ID
          setUploadSuccess(true);
        }
      }
    } catch (error) {
        setServerErr(error?.data?.message || 'Failed to upload');
    }
  };

  // File preview if available on UpdatingMode
  useEffect(() => {
    if (isUpdateMode) {
      setVideoPreview(video?.data?.videoFile)
      setThumbnailPreview(video?.data?.thumbnail)
    }
  },[isUpdateMode])
  //Navigate to videopost
  useEffect(() => {
    if (uploadSuccess && uploadedVideoId) {
      const timer = setTimeout(() => {
        navigate(`/video/${uploadedVideoId}`);
      }, 2000);
  
      return () => clearTimeout(timer); // Clear timeout on cleanup
    }
  }, [uploadSuccess, uploadedVideoId, navigate]);
  

  // Watch the video file and thumbnail for preview
  const videoFile = watch("videoFile");
  const thumbnailFile = watch("thumbnail");

  // Preview logic for video and thumbnail
  useEffect(() => {
    if (videoFile && videoFile.length > 0) {
      const file = videoFile[0];
      if (file.type.includes("video")) {
        setVideoPreview(URL.createObjectURL(file));
      } else {
        setError("videoFile", {
          type: "manual",
          message: "Only video files are allowed",
        });
        setVideoPreview(null);
      }
    }
  }, [videoFile, setError]);

  useEffect(() => {
    if (thumbnailFile && thumbnailFile.length > 0) {
      const file = thumbnailFile[0];
      if (file.type.includes("image")) {
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        setError("thumbnail", {
          type: "manual",
          message: "Only image files are allowed",
        });
        setThumbnailPreview(null);
      }
    }
  }, [thumbnailFile, setError]);

  return (
    <div className="max-w-lg mx-auto my-5 p-6 bg-base-300 rounded-box">
      <h2 className="text-2xl text-center font-bold mb-6">Upload Video</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Video File Input */}
        <div>
          <label className="block text-sm font-medium">Video File:</label>
          <input
            type="file"
            accept="video/*"
            {...register("videoFile", { required: !isUpdateMode ? "Video file is required" : false })}
            className="file-input file-input-bordered w-full mt-2"
          />
          {errors.videoFile && (
            <p className="text-error">{errors.videoFile.message}</p>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <video controls className="mt-4 w-full rounded-lg">
              <source src={videoPreview} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Thumbnail Input */}
        <div>
          <label className="block text-sm font-medium">Thumbnail Image:</label>
          <input
            type="file"
            accept="image/*"
            {...register("thumbnail", {
              required: !isUpdateMode ? "Thumbnail image is required" : false,
            })}
            className="file-input file-input-bordered w-full mt-2"
          />
          {errors.thumbnail && (
            <p className="text-error">{errors.thumbnail.message}</p>
          )}

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="mt-4 w-full rounded-lg"
            />
          )}
        </div>
        {/* Title and Description */}
        <div>
          <label className="form-control w-full ">
            <div className="label">
              <span className="label-text font-medium">Title: </span>
            </div>
            <input
              type="text"
              placeholder="What is your title?"
              defaultValue={video?.data?.title}
              className="input input-bordered w-full"
              {...register("title", { required: !isUpdateMode})}
            />
          </label>
        </div>
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              defaultValue={video?.data?.description}
              placeholder="what's on your mind?"
              {...register("description", { required: !isUpdateMode })}
            ></textarea>
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isLoading || updating} className="btn btn-primary">
          {isLoading || updating ? <span className="loading loading-bars loading-sm"></span> : `${isUpdateMode ? 'Update video' : 'Upload video'}` }
        </button>
      </form>
      {(isSuccess || updated) && (
            <div role="alert" className="alert z-20 fixed top-5 w-1/5 alert-success">
              <SiTicktick/>
              <span>{!isUpdateMode ? 'Video Published Successfully' : 'Video Updated Successfully'}</span>
            </div>
          )}
      {error && (
            <div role="alert" className="alert alert-error z-20 fixed top-1 w-1/4">
            <RxCrossCircled/>
            <span>{serverErr || "Failed to upload. Please try again."}</span>
          </div>
          )}
    </div>
  );
};

export default VideoForm;
