import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    incrementViews,
    getAllUserVideos,
    setWatchHistory
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllVideos);

router.route("/upload-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
);

router.route('/views/:videoId').patch(incrementViews)

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.fields([{ name: "videoFile", maxCount: 1},{ name: "thumbnail", maxCount: 1}]), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route('/uservideos/:userId').get(getAllUserVideos);

router.route('/add-wh/:videoId').patch(setWatchHistory);

export default router