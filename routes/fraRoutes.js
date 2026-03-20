const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const fraController = require("../controllers/fraController");

// GET all FRA tabs
// URL: GET http://localhost:5000/api/fra
router.get("/", fraController.getAllFRA);

// POST a new FRA tab with PDF
// URL: POST http://localhost:5000/api/fra
router.post("/", upload.single("pdfFile"), fraController.addFRA);

// PUT (Update) an existing FRA tab
// URL: PUT http://localhost:5000/api/fra/:id
router.put("/:id", upload.single("pdfFile"), fraController.updateFRA);

// DELETE an FRA tab
// URL: DELETE http://localhost:5000/api/fra/:id
router.delete("/:id", fraController.deleteFRA);

router.post("/reorder", fraController.reorderFra);

module.exports = router;
