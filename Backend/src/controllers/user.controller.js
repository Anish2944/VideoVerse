import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation- not empty
    // check if user already existby username or email
    // check for image , avatar etc...
    // upload them on cloudinary type service(multer->clodinry)
    // create user object- create entry in database
    // remove password and refresh token fields from response
    // check for user creation
    // return response
    const { fullName, email, username, password } = req.body //all data comes in req.body except files/images etc.
    // console.log(username)


    // If any fields are missing by user || VALIDATION
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // checking if user already exist
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }

    // console.log(req.files)
    //getting file path , using multer it gives access ton use req.files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) { //checking only avtar as it required during registration
        throw new ApiError(400, "Avatar file is required")
    }

    //uploading files on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(500, "failed to upload")
    }

    //creation
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //by default empty, as this file is optional 
        username: username.toLowerCase(),
        email,
        password,
    });

    //checking usercreation by removing password and refresh token
    const createdUser = await User.findById(user._id).select("-Password -refreshToken") //by default all selected thats why using minus symbol we are unselecting  

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
});

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    /*  req body -> data
        username or email requried
        find the user
        password check
        access and refresh token
        send cookie
    */

    const { username, email, password } = req.body;

    if (!username || !email) {
        throw new ApiError(401, "username and email are required")
    }
    // We can wite like this if want to make optional
    // if(!(username || email)){
    //     throw new ApiError(401, "username or email required")
    // }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    const ispasswordValid = await user.isPasswordCorrect(password);
    if (!ispasswordValid) {
        throw new ApiError(401, "Invalid user Crendetials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // console.log(accessToken)
    // console.log(refreshToken)
    const logedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: process.env.COOKIE_EXPIRY,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: logedInUser, accessToken, refreshToken
            },
                "User logged in Successfully")
        )

})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: null
        }
    }, {
        new: true
    })

    const options = {
        htttpOnly: true,
        secure: true,
        maxAge: 0,
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"))

})

const accessRefreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Verify the refresh token
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Find the user by ID from the decoded token
    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    // Compare the incoming refresh token with the one stored in the user's record
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or does not match");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Update the user's refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Set options for cookies (secure: true should only be used in production)
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Send the new tokens in cookies and the response body
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!(newPassword === confirmPassword)) {
        throw new ApiError(400, "ConfirmPassword not matched")
    }
    const user = await User.findById(req.user?._id)
    const ispasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!ispasswordValid) {
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "password changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetchd Successfully"))
})



const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req?.user._id, {
        $set: { fullName, email }
    }, { new: true }).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user, "Account details Updated Successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    // Get the local path of the avatar file from the request
    const avatarLocalPath = req.file?.path;

    // Check if the avatar file path is missing
    if (!avatarLocalPath) {
        // Throw an error if the avatar file is not provided in the request
        throw new ApiError(400, "Avatar file is missing");
    }

    //fetching user for url to delete existing file
    const existingUser = req.user;

    if (!existingUser || !existingUser.avatar) {
        throw new ApiError(400, "User or avatar not found");
    }
    await deleteFromCloudinary(existingUser.avatar);

    // Upload the avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // Check if there was an error while uploading the avatar
    if (!avatar.url) {
        // Throw an error if the upload to Cloudinary failed
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Update the user's document in the database with the new avatar URL
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url // Set the new avatar URL in the user's document
        }
    }, { new: true }) // Return the updated document
        .select("-Password -refreshToken"); // Exclude sensitive fields from the returned document

    // Send a JSON response with the updated user object
    return res.status(200).json(new ApiResponse(200, user, "Avatar Updated"));
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing")
    }

    const existingUser = req.user;
    if (!existingUser) {
        throw new ApiError(400, "User not found");
    }

    if (existingUser.coverImage) {
        await deleteFromCloudinary(existingUser.coverImage);
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-Password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user, "Avatar Updated"))
});

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;
    if(!username){
        throw new ApiError(400, "username is missing")
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(400, "channel doesn't exists")
    }
    return res.status(200).json( new ApiResponse(200, channel[0],"User channel fetched Successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user?._id)
        .populate({
          path: "watchHistory",
          populate: {
            path: "owner",
            select: "fullName username avatar",
          },
        })
        .exec();
  
      if (!user) {
        throw new ApiError(400, "Error while fetching watch history");
      }
  
      return res.status(200).json(new ApiResponse(200, user.watchHistory, "Watch History Fetched"));
    } catch (error) {
      throw new ApiError(500, "Internal Server Error");
    }
  });
  

export {
    registerUser,
    loginUser,
    logout,
    accessRefreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}