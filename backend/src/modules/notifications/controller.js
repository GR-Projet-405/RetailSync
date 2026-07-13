const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails(req.query);
  res.status(200).json({
    success: true,
    message: 'Notifications retrieved successfully',
    timestamp: new Date().toISOString(),
    data
  });
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const data = await service.fetchAnnouncements(req.query);
  res.status(200).json({
    success: true,
    message: 'Announcements retrieved successfully',
    timestamp: new Date().toISOString(),
    data,
  });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const data = await service.createAnnouncement(req.body);
  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data,
  });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const data = await service.updateAnnouncement(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const data = await service.markAsRead(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data,
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const data = await service.markAllAsRead();
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data,
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const data = await service.deleteNotification(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
    data,
  });
});

const clearNotifications = asyncHandler(async (req, res) => {
  const data = await service.clearNotifications(req.query);
  res.status(200).json({
    success: true,
    message: 'Notifications cleared successfully',
    data,
  });
});

module.exports = {
  getDetails,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
};
