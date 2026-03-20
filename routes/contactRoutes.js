
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Get the current contact info (usually just one record)
router.get('/', contactController.getContact);

// Update contact info
router.put('/', contactController.updateContact);

module.exports = router;