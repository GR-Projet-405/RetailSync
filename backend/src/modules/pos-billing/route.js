const express = require('express');
const router = express.Router();
const { getDetails, sendReceipt } = require('./controller');

router.get('/', getDetails);
router.post('/send-receipt', sendReceipt);

module.exports = router;
