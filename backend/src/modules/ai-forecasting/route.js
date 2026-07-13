const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Module info (no auth needed)
router.get('/', controller.getDetails);

// Protected forecast endpoints
router.get('/forecast', verifyToken, controller.getForecast);
router.post('/forecast/refresh', verifyToken, controller.refreshForecast);

module.exports = router;
