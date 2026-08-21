const express = require('express');
const router = express.Router();
const { getDetails, sendReceipt, adjustStock } = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', getDetails);
router.post('/send-receipt', sendReceipt);
router.post('/adjust-stock', adjustStock);

module.exports = router;
