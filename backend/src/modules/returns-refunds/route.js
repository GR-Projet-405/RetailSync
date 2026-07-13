const express = require('express');
const router = express.Router();
const controller = require('./controller');
const upload = require('./cloudinaryConfig'); // import cloudinary middleware

// 1. Verify Receipt
router.get('/verify/:receiptId', controller.verifyReceiptHandler);

// 2. Create Return Request 
router.post('/request', upload.single('photoProof'), controller.createReturnHandler);

// 3. Get Return Status
router.get('/status/:returnId', controller.getReturnStatusHandler);

// 4. Get Return History
router.get('/history', controller.getHistoryHandler);

// 5. Review Return Request (Approve/Reject)
router.patch('/review/:returnId', controller.reviewReturnHandler);

// 6. Process Refund & Deduct Points 
router.patch('/refund/:returnId', controller.processRefundHandler);

module.exports = router;