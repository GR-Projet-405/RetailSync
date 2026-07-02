const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Fetch current details
router.get('/', verifyToken, controller.getDetails);

// Update editable textual details
router.put('/update', verifyToken, controller.updateProfile);

module.exports = router;