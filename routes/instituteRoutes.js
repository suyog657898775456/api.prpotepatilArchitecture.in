const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const instCtrl = require("../controllers/instituteController");

router.get("/", instCtrl.getInstitutes);
router.post("/", upload.single("image"), instCtrl.addInstitute);
router.put("/:id", upload.single("image"), instCtrl.updateInstitute);
router.delete("/:id", instCtrl.deleteInstitute);

module.exports = router;
