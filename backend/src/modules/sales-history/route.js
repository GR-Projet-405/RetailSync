const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');

router.get('/', controller.getDetails);
router.get('/dashboard', verifyToken, hasRole('ADMIN', 'BRANCH_MANAGER'), controller.getDashboard);

module.exports = router;
