const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const syllabusController = require("../controllers/syllabusController");

router.get("/", syllabusController.getSyllabus);
router.post("/", upload.single("pdf"), syllabusController.uploadSyllabus);
router.put("/:id", upload.single("pdf"), syllabusController.updateSyllabus);
router.delete("/:id", syllabusController.deleteSyllabus);
router.post("/reorder", syllabusController.reorderSyllabus);

module.exports = router;
