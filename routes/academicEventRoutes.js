const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const academicCtrl = require("../controllers/academicEventController");

const acadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "additionalImages", maxCount: 15 },
]);

router.get("/", academicCtrl.getAcademicEvents);
router.post("/", acadFields, academicCtrl.saveAcademicEvent);

// Correctly linked to the controller functions
router.patch("/highlight/:id", academicCtrl.toggleAcademicHighlight);
router.delete("/:id", academicCtrl.deleteAcademicEvent);
router.post("/reorder", academicCtrl.reorderAcademicEvents);

module.exports = router;