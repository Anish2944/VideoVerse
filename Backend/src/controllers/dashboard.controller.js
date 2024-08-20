import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(400, "channel is missing")
    }

    const result = {};

    const totalSubscriber = await Subscription.countDocuments({
        channel: userId
    }) 
    result.totalSubscriber = totalSubscriber;

    const stats = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: "$views"
                },
                videoIds: {
                    $push: "$_id"
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "videoIds", //better approch _id as we group already
                foreignField: "video",
                as: "likesOnVideos"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "videoIds", //better approch _id as we group already
                foreignField: "video",
                as: "commentsOnVideos"
            }
        },
        {
            $project: {
                totalViews: 1,
                totalVideos: 1,
                totalLikes: {
                    $size: "$likesOnVideos"
                },
                totalComments: {
                    $size: "$commentsOnVideos"
                }
            }
        }
    ])
    result.stats = stats.length > 0 
    ? stats[0] : { totalViews: 0, totalLikes: 0, totalVideos: 0, totalComments: 0 }

    return res.stats(200).json(new ApiResponse(200, result, "stats fetched successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(400, "channel is missing")
    }

    const channelVideos = await Video.find({
        owner: userId
    })

    if (channelVideos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No videos found"))
    }

    return res.status(200).json(new ApiResponse(200,channelVideos," videos found "))
})

export {
    getChannelStats, 
    getChannelVideos
    }