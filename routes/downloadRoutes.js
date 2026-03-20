const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const downloadController = require("../controllers/downloadController");

router.get("/", downloadController.getDownloads);
router.post("/", upload.single("pdf"), downloadController.uploadDownload);
router.put("/:id", upload.single("pdf"), downloadController.updateDownload);
router.delete("/:id", downloadController.deleteDownload);
router.post("/reorder", downloadController.reorderDownloads);

module.exports = router;
