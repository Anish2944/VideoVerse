import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, videoId } = req.body;
  
    if (!name) {
      throw new ApiError(400, "Playlist name is required");
    }
  
    const owner = req.user._id;
    if (!owner) {
      throw new ApiError(401, "Owner not found");
    }
  
    const playlistData = {
      name,
      owner,
    };

    if (videoId || mongoose.Types.ObjectId.isValid(videoId)) {
      playlistData.videos = [videoId];
    }
  
    const playlist = await Playlist.create(playlistData);
  
    if (!playlist) {
      throw new ApiError(500, "Something went wrong while creating the playlist");
    }
  
    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
  });
  

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Fetch playlists and populate video thumbnails
    const playlists = await Playlist.find({ owner: userId })
        .populate({
            path: 'videos',
            select: 'thumbnail', // Fetch only the thumbnail field from videos
        })
        .sort({ createdAt: -1 });

    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "Playlists not found");
    }

    return res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(400, "Playlist not found")
    }
    
    const playlist = await Playlist.findById(playlistId).populate('videos')
    if (!playlist) {
        throw new ApiError(404, "requested playlist not found")
    }

    return res.status(200).json(new ApiResponse(201,playlist,"playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400,"Playlist or video is missing")
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { 
            $push: { videos: videoId } 
        },
        { new: true }
    )
    if (!playlist) {
        throw new ApiError(500, "Failed to add video or playlist doesn't exist")
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400,"Playlist or video is missing")
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
    {
        $pull: { videos: videoId }
    },
    { new: true }
    )
    if (!playlist) {
        throw new ApiError(500, "Failed to remove video or playlist doesn't exist")
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400,"Playlist is missing")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(500, "Failed to delete playlist")
    }
    return res.status(201).json(new ApiResponse(201, {}, "playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        req.params.playlistId,
        { name, description },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}