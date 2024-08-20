import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    if (!videoId) {
        throw new ApiError(400,"Video is Missing")
    }
    const {page = 1, limit = 10} = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    const comments = await Comment.find({video: videoId})
    .sort({createdAt: -1})
    .skip((pageNumber - 1)* limitNumber)
    .limit(limitNumber)

    const totalComments = await Comment.countDocuments({video: videoId})

    return res.status(201).json(new ApiResponse(201, {
        comments,
        totalComments,
        totalPage: Math.ceil(totalComments / limitNumber),
        currentpage: pageNumber
    }, "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400,"Video is Missing")
    }
    const owner = req.user._id;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(401,"Comment cannot be Empty")
    }

    const comment = await Comment.create({
        content,
        owner,
        video: videoId,
    })
    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(401, "Comment is Missing")
    }

    const { content } = req.body;
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },  // Ensure comment exists and is owned by the user
        { content },  // Update the content field
        { new: true, runValidators: true }  // Return the updated document
    );

    // const comment = await Comment.findById(commentId);
    // if (!comment) {
    //     throw new ApiError(500,"Comment not found")
    // }

    // if (comment.owner.toString() !== req.user._id.toString()) {
    //     throw new ApiError(403, "You do not have permission to update this comment");
    // }
    // comment.content = content;
    // const updatedComment = await comment.save();

    // if (!updatedComment) {
    //     throw new ApiError(500, "Failed to update")
    // }
    if (!updatedComment) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    return res.status(201).json(new ApiResponse(201,updatedComment,"Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400,"comment is Missing")
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    });

    if (!deletedComment) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    return res.status(201).json(new ApiResponse(201,{},"Comment Deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}