const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/verify/:receiptId', controller.verifyReceiptHandler);

router.post('/request', controller.createReturnHandler);

router.get('/status/:returnId', controller.getReturnStatusHandler);

module.exports = router;