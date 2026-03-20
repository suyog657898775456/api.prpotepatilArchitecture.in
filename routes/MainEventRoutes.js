const express = require("express");
const router = express.Router();
const mainEventController = require("../controllers/MaineventController");

// Public route to get events for the main website
router.get("/", mainEventController.getPublicEvents);

// Get details for a single event
router.get("/:id", mainEventController.getEventById);

module.exports = router;