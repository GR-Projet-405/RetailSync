const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getTickets);
router.post('/', controller.createTicket);

router.get('/:id', controller.getTicketById);
router.post('/:id/messages', controller.addMessage);
router.patch('/:id/status', controller.updateTicketStatus);

module.exports = router;
