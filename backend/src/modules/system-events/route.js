const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getDetails);
router.get('/stats', controller.getStats);
router.get('/events', controller.getEvents);

module.exports = router;
