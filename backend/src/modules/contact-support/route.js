const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { createContactMessageSchema, validate } = require('./validation');

router.get('/', controller.getMessages);
router.post('/', validate(createContactMessageSchema), controller.createMessage);

router.get('/:id', controller.getMessageById);
router.patch('/:id/status', controller.updateMessageStatus);

module.exports = router;