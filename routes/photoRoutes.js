const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // Use your existing images subfolder middleware
const photoCtrl = require("../controllers/photoController");

router.get("/", photoCtrl.getAllPhotos);
router.post("/", upload.single("image"), photoCtrl.addPhoto);
router.put("/:id", upload.single("image"), photoCtrl.updatePhoto);
router.delete("/:id", photoCtrl.deletePhoto);
router.post("/reorder", photoCtrl.reorderPhotos);

module.exports = router;
