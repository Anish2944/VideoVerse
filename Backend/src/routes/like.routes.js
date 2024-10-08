import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getNumberOfLikesOnVideoById,
    getNumberOfLikesOnCommentById,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/videolikes/:videoId").get(getNumberOfLikesOnVideoById);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/commentlikes/:commentId").get(getNumberOfLikesOnCommentById);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/likedvideos").get(getLikedVideos);

export default router