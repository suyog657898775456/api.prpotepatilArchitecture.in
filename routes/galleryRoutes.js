
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const galleryCtrl = require("../controllers/galleryController");

router.get("/", galleryCtrl.getAllProjects);
router.post("/", upload.any(), galleryCtrl.saveProject);
router.delete("/:id", galleryCtrl.deleteProject);
router.post("/reorder", galleryCtrl.reorderProjects);

module.exports = router;