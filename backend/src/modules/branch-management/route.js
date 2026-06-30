const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.get('/', controller.getDetails);
router.get('/active', verifyToken, controller.getActiveBranches);

module.exports = router;
