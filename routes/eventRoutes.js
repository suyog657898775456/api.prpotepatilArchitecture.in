const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const eventController = require("../controllers/eventController");

router.get("/", eventController.getAllEvents);

// Line 10: This will no longer crash because addEvent is now exported properly
router.post("/", upload.single("coverImage"), eventController.addEvent);

router.put("/:id", upload.single("coverImage"), eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);
router.post("/reorder", eventController.reorderEvents);

module.exports = router;
