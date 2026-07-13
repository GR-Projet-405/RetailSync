const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Module info (public)
router.get('/', controller.getDetails);

// Protected alert endpoints
router.get('/list', verifyToken, controller.getAlerts);
router.post('/generate', verifyToken, controller.generateAlerts);
router.get('/:id', verifyToken, controller.getAlertById);
router.patch('/:id/acknowledge', verifyToken, controller.acknowledgeAlert);
router.delete('/:id', verifyToken, controller.deleteAlert);

module.exports = router;
