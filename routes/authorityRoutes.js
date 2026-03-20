const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authCtrl = require("../controllers/authorityController");

router.get("/", authCtrl.getAuthorities);
router.post("/", upload.single("image"), authCtrl.saveAuthority);
router.delete("/:id", authCtrl.deleteAuthority);

module.exports = router;
