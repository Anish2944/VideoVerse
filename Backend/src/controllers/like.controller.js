import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    try {
      const existingLike = await Like.findOne({
        likeBy: req.user._id,
        video: videoId,
      });
  
      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Video unliked successfully"));
      }
  
      // If like doesn't exist, create it (like)
      await Like.create({
        video: videoId,
        likeBy: req.user._id,
      });
  
      return res
        .status(201)
        .json(new ApiResponse(201, {}, "Video liked successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "An error occurred while toggling the like"));
    }
  });
  
const getNumberOfLikesOnVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    try {
      // Find all likes for the given video
      const likes = await Like.find({ video: videoId }).populate('likeBy', 'username'); // Populate with user data, e.g., username
  
      // Get the number of likes
      const NoOfLikesOnVideo = likes.length;
  
      // Send response with the number of likes and users who liked the video
      return res
        .status(200)
        .json(
          new ApiResponse(200, { NoOfLikesOnVideo, likedBy: likes }, "Number Of Likes Fetched")
        );
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to fetch likes"));
    }
  });
  

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const { commentId } = req.params;
  
    try {
      const existingLike = await Like.findOne({
        likeBy: req.user._id,
        comment: commentId,
      });
  
      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "comment unliked successfully"));
      }
  
      // If like doesn't exist, create it (like)
      await Like.create({
        comment: commentId,
        likeBy: req.user._id,
      });
  
      return res
        .status(201)
        .json(new ApiResponse(201, {}, "comment liked successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "An error occurred while toggling the like"));
    }
  });
  const getNumberOfLikesOnCommentById = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
  
    try {
      const likes = await Like.find({ comment: commentId }).populate('likeBy', 'username'); // Populate with user data, e.g., username
  
      const NoOfLikesOnComment = likes.length;
  
      return res
        .status(200)
        .json(
          new ApiResponse(200, { NoOfLikesOnComment, likedBy: likes }, "Number Of Likes Fetched")
        );
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to fetch likes"));
    }
  });

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const liked = await Like.findOne({
        likeBy: req.user._id,
        tweet: tweetId
    })

    if (liked.length > 0) {
        await Like.findByIdAndDelete(liked[0]._id)
        return res.status(200).json(new ApiResponse(201,{},"Tweet unliked"))
    }

    await Like.create({
        tweet: tweetId,
        likeBy: req.user._id
    })

    return res.status(201).json(new ApiResponse(201,{},"Tweet Liked"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likeBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: '$videoDetails'
        },
        {
            $project: {
                _id: 0,
                videoDetails: 1
            }
        }
    ])
    

    if (!likedVideos.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked videos found"));
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getNumberOfLikesOnVideoById,
    getNumberOfLikesOnCommentById
}