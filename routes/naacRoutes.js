const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const naacCtrl = require("../controllers/naacController");

router.get("/", naacCtrl.getNaacTabs);
router.post("/", upload.any(), naacCtrl.saveNaacTab);
router.delete("/:id", naacCtrl.deleteNaacTab);

// ADDED: Reorder route
router.post("/reorder", naacCtrl.reorderNaac);

module.exports = router;