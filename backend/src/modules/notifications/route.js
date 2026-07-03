const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.get('/announcements', controller.getAnnouncements);
router.post('/announcements', controller.createAnnouncement);
router.patch('/announcements/:id', controller.updateAnnouncement);
router.put('/announcements/:id', controller.updateAnnouncement);

router.get('/', controller.getDetails);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);
router.delete('/', controller.clearNotifications);
router.delete('/:id', controller.deleteNotification);

module.exports = router;
