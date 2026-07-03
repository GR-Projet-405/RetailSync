const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getDetails);

router.get('/branches', controller.getBranches);

module.exports = router;
