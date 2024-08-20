import { Router } from 'express'

import { loginUser, logout, registerUser, accessRefreshToken, 
    changeCurrentPassword, getCurrentUser, updateAccountDetails, 
    updateUserAvatar, updateUserCoverImage, getUserChannelProfile, 
    getWatchHistory } from '../controllers/user.controller.js'

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route("/register").post(
    upload.fields([ //middleware
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT, logout)
router.route("/refresh-token").post(accessRefreshToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-Acc-details").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch( verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/chprofile/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router