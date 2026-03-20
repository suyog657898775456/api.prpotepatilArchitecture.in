const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const flyerCtrl = require("../controllers/activityFlyerController");

router.get("/", flyerCtrl.getFlyers);
router.post("/", upload.single("image"), flyerCtrl.saveFlyer);
router.delete("/:id", flyerCtrl.deleteFlyer);
router.post("/reorder", flyerCtrl.reorderFlyers);

module.exports = router;
