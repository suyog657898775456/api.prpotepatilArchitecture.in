const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

router.get("/", videoController.getAllVideos);
router.post("/", videoController.addVideo);
router.put("/:id", videoController.updateVideo);
router.patch("/:id/featured", videoController.toggleFeatured);
router.delete("/:id", videoController.deleteVideo);
router.post("/reorder", videoController.reorderVideos);

module.exports = router;
