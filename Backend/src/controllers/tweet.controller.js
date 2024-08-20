import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const owner = req.user._id;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(401,"cannot tweet without content")
    }

    const tweet = await Tweet.create({
        content,
        owner
    })

    return res.status(201).json(new ApiResponse(201, tweet, "tweet is created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(401, " User not found")
    }

    const tweets = await Tweet.find({owner: userId})
    .sort({craetedAt: -1})

    return res.status(201).json(new ApiResponse(201,tweets,"tweets has been fetched successfully"))
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "missing tweet")
    }
    const { content } = req.body;

    const updatedTweet = await Tweet.findByIdAndUpdate(
        { _id: tweetId, owner: req.user._id },
        { content },
        { new: true, runValidators: true}
    )
    if (!updatedTweet) {
        throw new ApiError(403, " you do not have permission to update this tweet")
    }

    return res.status(201).json(new ApiResponse(201, updatedTweet,"tweet has been updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "missing tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete({
        _id: tweetId,
        owner: req.user._id
    })
    if (!deletedTweet) {
        throw new ApiError(403, " you do not have permission to update this tweet")
    }

    return res.status(201).json(new ApiResponse(201, {}, "tweet has been deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}