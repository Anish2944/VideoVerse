import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400, "Channel is missing")
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(400, "user is missing")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(new ApiResponse(200,{},"Channel unsubscribed"))
    } else {
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        });
        return res.status(200).json(new ApiResponse(200,{},"Channel subscribed"))
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId) {
        throw new ApiError(400, "Channel is missing")
    }
    const subscriber = await Subscription.find({
        channel: channelId
    }).select("-channel -_id")
    if (subscriber.length === 0) {
        return res.status(200).json(new ApiResponse(200,[], "No subscriber found"))
    }
    return res.status(200).json(new ApiResponse(200,subscriber, "subscribers found"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "Channel is missing")
    }
    const channels = await Subscription.find({
        subscriber: subscriberId
    }).select("-subscriber -_id")
    if (channels.length === 0) {
        return res.status(200).json(new ApiResponse(200,[], "No channels found"))
    }

    return res.status(200).json(new ApiResponse(200,channels, "channels found"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}