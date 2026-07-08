const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, controller.getProducts);

module.exports = router;