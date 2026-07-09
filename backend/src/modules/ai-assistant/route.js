const express = require('express');
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const {
  chatSchema,
  historyQuerySchema,
  validateBody,
  validateQuery,
} = require('./validation');

const router = express.Router();

router.use(verifyToken);

router.get('/', controller.getDetails);
router.post('/chat', validateBody(chatSchema), controller.chat);
router.get('/history', validateQuery(historyQuerySchema), controller.getHistory);
router.get('/history/:id', controller.getConversationById);
router.delete('/history/:id', controller.deleteConversation);

module.exports = router;
