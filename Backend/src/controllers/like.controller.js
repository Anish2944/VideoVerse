import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const liked = await Like.findOne({
        likeBy: req.user._id,
        video: videoId
    })

    if (liked.length > 0) {
        await Like.findByIdAndDelete(liked[0]._id)
        return res.status(200).json(new ApiResponse(201,{},"Video unliked"))
    }

    await Like.create({
        video: videoId,
        likeBy: req.user._id
    })

    return res.status(201).json(new ApiResponse(201,{},"Video Liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const commentLike = await Like.findOne({
        likeBy: req.user._id,
        video: commentId
    })

    if (commentLike.length > 0) {
        await Like.findByIdAndDelete(commentLike[0]._id)
        return res.status(200).json(new ApiResponse(201,{},"comment unlike"))
    }

    await Like.create({
        comment: commentId,
        likeBy: req.user._id
    })

    return res.status(201).json(new ApiResponse(201,{},"comment Liked"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const liked = await Like.findOne({
        likeBy: req.user._id,
        video: videoId
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
                likeBy: req.user._id
            }
        },
        {
            $group: {
                _id: "$video"
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
            $unwind: "$videoDetails"
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
    getLikedVideos
}