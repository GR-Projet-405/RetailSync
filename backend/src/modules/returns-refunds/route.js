const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/verify/:receiptId', controller.verifyReceiptHandler);
router.post('/request', controller.createReturnHandler);
router.get('/status/:returnId', controller.getReturnStatusHandler);
router.get('/history', controller.getHistoryHandler);
router.patch('/review/:returnId', controller.reviewReturnHandler);
router.patch('/refund/:returnId', controller.processRefundHandler);
module.exports = router;