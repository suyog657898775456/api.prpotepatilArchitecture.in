const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const tourCtrl = require("../controllers/collegeTourController");

router.get("/", tourCtrl.getTours);
router.post("/", upload.array("images", 10), tourCtrl.saveTour); // Allows up to 10 images
router.delete("/:id", tourCtrl.deleteTour);
router.post("/reorder", tourCtrl.reorderTours);

module.exports = router;
