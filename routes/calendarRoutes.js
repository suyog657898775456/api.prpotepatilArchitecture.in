const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // Using your existing multer middleware
const calendarController = require("../controllers/calendarController");

router.get("/", calendarController.getCalendars);
router.post("/", upload.single("pdf"), calendarController.uploadCalendar);
router.put("/:id", upload.single("pdf"), calendarController.updateCalendar);
router.delete("/:id", calendarController.deleteCalendar);
router.post("/reorder", calendarController.reorderCalendars);

module.exports = router;
