const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const newsController = require("../controllers/newsController");

// Standard CRUD routes
router.get("/", newsController.getAllItems);
router.post("/", upload.single("file"), newsController.addItem);
router.put("/:id", upload.single("file"), newsController.updateItem);
router.delete("/:id", newsController.deleteItem);

// --- DRAG & DROP REORDER ROUTE ---
// This matches the axios.post(`${API_URL}/reorder`, ...) call in your frontend
router.post("/reorder", newsController.reorderNews);

module.exports = router;
