const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, controller.getTransfers);
router.get('/:id', verifyToken, controller.getTransferById);
router.post('/', verifyToken, controller.createTransfer);
router.patch('/:id/status', verifyToken, controller.updateTransferStatus);

module.exports = router;
