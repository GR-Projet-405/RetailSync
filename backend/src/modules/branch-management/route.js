const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', hasPermission('branches.view'), controller.getBranches);

module.exports = router;