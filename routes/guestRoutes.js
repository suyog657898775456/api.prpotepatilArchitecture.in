const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const guestCtrl = require("../controllers/guestController");

router.get("/", guestCtrl.getGuests);
router.post("/", upload.single("image"), guestCtrl.addGuest);
router.put("/:id", upload.single("image"), guestCtrl.updateGuest);
router.delete("/:id", guestCtrl.deleteGuest);
router.post("/reorder", guestCtrl.reorderGuests);

module.exports = router;
