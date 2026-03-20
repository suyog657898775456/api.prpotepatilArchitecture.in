const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // Ensure this handles PDF
const resultCtrl = require("../controllers/resultController");

router.get("/", resultCtrl.getAllResults);
router.post("/", upload.single("pdfFile"), resultCtrl.addResult);
router.put("/:id", upload.single("pdfFile"), resultCtrl.updateResult);
router.delete("/:id", resultCtrl.deleteResult);
router.post("/reorder", resultCtrl.reorderResults);

module.exports = router;
