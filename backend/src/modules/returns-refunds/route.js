const { verifyToken, hasPermission, hasRole } = require('../../middleware/auth.middleware'); 
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const upload = require('./cloudinaryConfig'); // import cloudinary middleware

// 1. Verify Receipt
router.get('/verify/:receiptId', verifyToken, hasPermission('sales.manage'), controller.verifyReceiptHandler);

// 2. Create Return Request 
router.post('/request', verifyToken, hasPermission('sales.manage'), upload.array('photoProofs', 20), controller.createReturnHandler);

// 3. Get Return Status
router.get('/status/:returnId', verifyToken, hasPermission('sales.view'), controller.getReturnStatusHandler);

// 4. Get Return History
router.get('/history', verifyToken, hasPermission('sales.view'), controller.getHistoryHandler);

// 5. Review Return Request (Approve/Reject)
router.patch('/review/:returnId', verifyToken, hasRole('BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'), controller.reviewReturnHandler);

// 6. Process Refund & Deduct Points 
router.patch('/refund/:returnId', verifyToken, hasRole('BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'), controller.processRefundHandler);

module.exports = router;