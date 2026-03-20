
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const staffController = require('../controllers/staffController');

// Get all staff
router.get('/', staffController.getAllStaff);

// Add new staff with image
router.post('/', upload.single('image'), staffController.addStaff);

// Update staff (handles optional new image)
router.put('/:id', upload.single('image'), staffController.updateStaff);

// Toggle featured status
router.patch('/:id/featured', staffController.toggleFeatured);

// Delete staff
router.delete('/:id', staffController.deleteStaff);

router.post('/reorder', staffController.reorderStaff);

module.exports = router;