const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Fetch current details
router.get('/', verifyToken, controller.getDetails);

// Update editable textual details
router.put('/update', verifyToken, controller.updateProfile);

// New endpoint for updating user account security credentials
router.put('/change-password', verifyToken, controller.changePassword);

module.exports = router;