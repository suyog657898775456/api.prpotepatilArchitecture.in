const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const highlightController = require("../controllers/highlightController");

router.get("/", highlightController.getHighlights);
router.post("/", upload.single("coverImage"), highlightController.addHighlight);
router.put(
  "/:id",
  upload.single("coverImage"),
  highlightController.updateHighlight,
);
router.delete("/:id", highlightController.deleteHighlight);
router.post("/reorder", highlightController.reorderHighlights);

module.exports = router;
