
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const sliderController = require('../controllers/sliderController');

router.get('/', sliderController.getSliderImages);
router.post('/add', upload.single('image'), sliderController.addImage);
router.delete('/:id', sliderController.deleteImage);
router.post('/reorder', sliderController.reorderImages);

module.exports = router;