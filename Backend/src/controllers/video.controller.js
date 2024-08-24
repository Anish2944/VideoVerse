import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import fs from "fs"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 9, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const filter = {};

    if (query) {
        filter.title = {
            $regex: query,
            $options: "i"
        };
    }
    if (userId) {
        filter.owner = userId;
    }

    const sortOrder = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
    .sort({[sortBy]: sortOrder})
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
 
    const totalVideos = await Video.countDocuments(filter);

    return res.status(201).json(new ApiResponse(201, {
        videos,
        totalVideos,
        totalPage: Math.ceil(totalVideos / limitNumber),
        currentpage: pageNumber
    }, "videos fetched successfully"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(401, "title and description are required")
    }

    const owner = await User.findById(ownerId);

    console.log("req.files:", req.files);

    let videoFilePath, thumbnailPath;
    if (req.files?.videoFile && req.files.videoFile.length > 0) {
        videoFilePath = req.files.videoFile[0].path;
    }

    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailPath = req.files.thumbnail[0].path;
    }

    const videoFile = videoFilePath ? await uploadOnCloudinary(videoFilePath) : null;
    if (!videoFile) {
        throw new ApiError("failed to upload video")
    }
    const thumbnail = thumbnailPath ? await uploadOnCloudinary(thumbnailPath) : null;
    if (!thumbnail) {
        throw new ApiError("failed to upload thumbnail")
    }

    const newVideo = new Video({
        owner: ownerId,
        channel: owner.username,
        avatar: owner.avatar,
        title,
        description,
        duration: videoFile?.duration || null,
        videoFile: videoFile?.url || null,
        thumbnail: thumbnail?.url || null,
    });

    await newVideo.save();

    return res.status(201).json(new ApiResponse(201, newVideo, "Video created successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400, "Video is Missing")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "failed to fetch")
    }
    return res.status(200).json(new ApiResponse(200, video, "Video fetched Successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is missing");
    }

    const { title, description } = req.body;
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this video");
    }

    // Update title and description if provided
    if (title) video.title = title;
    if (description) video.description = description;

    // Update video file if provided
    if (req.files?.videoFile?.length > 0) {
        const videoFilePath = req.files.videoFile[0].path;
        try {
            const videoFile = await uploadOnCloudinary(videoFilePath);
            if (videoFile?.url) {
                await deleteFromCloudinary(video.videoFile); // Delete the old video file from Cloudinary
                video.videoFile = videoFile.url;
            }
        } catch (error) {
            console.error("Error while uploading video file:", error);
            throw new ApiError(500, "Failed to update video file");
        }
    }

    // Update thumbnail if provided
    if (req.files?.thumbnail?.length > 0) {
        const thumbnailPath = req.files.thumbnail[0].path;
        try {
            const thumbnail = await uploadOnCloudinary(thumbnailPath);
            if (thumbnail?.url) {
                await deleteFromCloudinary(video.thumbnail); // Delete the old thumbnail from Cloudinary
                video.thumbnail = thumbnail.url;
            }
        } catch (error) {
            console.error("Error while uploading thumbnail:", error);
            throw new ApiError(500, "Failed to update thumbnail");
        }
    }

    // Save updated video details
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "Video is Missing")
    }
    const video = await Video.findById(videoId);
    console.log(video) 
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }
    try {
        const deleteVideoResult = await deleteFromCloudinary(video.videoFile);
        console.log("Delete video result:", deleteVideoResult);
    
        const deleteThumbnailResult = await deleteFromCloudinary(video.thumbnail);
        console.log("Delete thumbnail result:", deleteThumbnailResult);
    
        if (deleteVideoResult.result === 'ok' && deleteThumbnailResult.result === 'ok') {
            await Video.findByIdAndDelete(videoId);
            return res.status(200).json(new ApiResponse(200, {}, "Video Deleted Successfully"));
        } else {
            throw new Error("Failed to delete video or thumbnail from Cloudinary");
        }
    } catch (error) {
        console.error("Error in deleting video:", error);
        throw new ApiError(500, "Failed to delete video");
    }
    

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video is Missing")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished
    await video.save();
    return res.status(200).json(new ApiResponse(200, video, "status changed"))
})

const incrementViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
        videoId,
        {$inc: { views: 1}},
        {new: true}
    );
    if (!video) {
        throw new ApiError(404, "video not found")
    }

    return res.status(200).json(new ApiResponse(200, video, "View Incremented"))
})

const getAllUserVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by userId
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(404, "userId is missing")
    }

    const userVideos = await Video.find({
        owner: userId
    })

    if (userVideos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No videos found"))
    }

    return res.status(200).json(new ApiResponse(200,userVideos," videos found "))
})

const setWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    if (!userId) {
        throw new ApiError(400, "User is missing or unauthorized");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Add the new video ID to the watchHistory array
    // Remove it first if it already exists (to prevent duplicates)
    user.watchHistory = user.watchHistory.filter(id => id.toString() !== videoId);

    // Add the new video ID to the beginning (to make it the latest)
    user.watchHistory.unshift(videoId);

    // Check if the length exceeds 15, and remove oldest entries
    const maxHistoryLength = 15;
    if (user.watchHistory.length > maxHistoryLength) {
        // Keep only the most recent 15 entries
        user.watchHistory = user.watchHistory.slice(0, maxHistoryLength);
    }

    await user.save();

    return res.status(201).json(new ApiResponse(201, user.watchHistory, "Video added to watch history successfully"));
});

  
  

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViews,
    getAllUserVideos,
    setWatchHistory
}