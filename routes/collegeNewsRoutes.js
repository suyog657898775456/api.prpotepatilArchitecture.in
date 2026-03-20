const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // Uses your  logic for images
const newsCtrl = require("../controllers/collegeNewsController");

router.get("/", newsCtrl.getAllCollegeNews);
router.post("/", upload.single("image"), newsCtrl.addCollegeNews);
router.put("/:id", upload.single("image"), newsCtrl.updateCollegeNews);
router.delete("/:id", newsCtrl.deleteCollegeNews);
router.post("/reorder", newsCtrl.reorderCollegeNews);

module.exports = router;
