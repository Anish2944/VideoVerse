import React, { useState, useEffect } from "react";
import { SiTicktick } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx";
import { useForm } from "react-hook-form";
import { useUploadVideoMutation } from "../services/videoApi";
import { useNavigate } from "react-router-dom";

const VideoForm = () => {
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
  const navigate = useNavigate();
  const [serverErr,setServerErr] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);

  const onSubmit = async (data) => {
    try {
      console.log("Form Submitted: ", data);
      const formData = new FormData();
      formData.append("videoFile", data.videoFile[0]);
      formData.append("thumbnail", data.thumbnail[0]);
      formData.append("title", data.title);
      formData.append("description", data.description);

      const response = await uploadVideo(formData).unwrap();
      if (response.success) {
        setUploadedVideoId(response?.data?._id); // Store the uploaded video ID
        setUploadSuccess(true);
      }
    } catch (error) {
        setServerErr(error?.data?.message || 'Failed to upload');
    }
  };
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
    <div className="max-w-lg mx-auto my-5 p-6 bg-base-200 rounded-box">
      <h2 className="text-2xl font-bold mb-6">Upload Video</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Video File Input */}
        <div>
          <label className="block text-sm font-medium">Video File:</label>
          <input
            type="file"
            accept="video/*"
            {...register("videoFile", { required: "Video file is required" })}
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
              required: "Thumbnail image is required",
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
              className="input input-bordered w-full "
              {...register("title", { required: true })}
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
              placeholder="what's on your mind?"
              {...register("description", { required: true })}
            ></textarea>
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">
          Upload Video
        </button>
      </form>
      {isSuccess && (
            <div role="alert" className="alert z-20 fixed top-5 w-1/5 alert-success">
              <SiTicktick/>
              <span>Video Published Successfully</span>
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
