const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getDetails);
router.get('/dashboard', controller.getDashboardData);
router.get('/activity-logs', controller.getActivityLogs);

module.exports = router;
