const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const ntStaffController = require("../controllers/nonTeachingController");

router.get("/", ntStaffController.getAllStaff);
router.post("/", upload.single("image"), ntStaffController.addStaff);
router.put("/:id", upload.single("image"), ntStaffController.updateStaff);
router.patch("/:id/featured", ntStaffController.toggleFeatured);
router.delete("/:id", ntStaffController.deleteStaff);
router.post("/reorder", ntStaffController.reorderStaff);

module.exports = router;
