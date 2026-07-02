const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware'); // Adjust relative path to your auth middleware

// Secure the route so only logged-in, verified users can fetch their details
router.get('/', verifyToken, controller.getDetails);

module.exports = router;