const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
  });
};

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.getModuleDetails();
  sendSuccess(res, 200, 'AI Assistant module is active.', data);
});

const chat = asyncHandler(async (req, res) => {
  const data = await service.chat(req.body, req.user._id);
  sendSuccess(res, 200, 'AI Assistant response generated successfully.', data);
});

const getHistory = asyncHandler(async (req, res) => {
  const data = await service.getHistory(req.user._id, req.query);
  sendSuccess(res, 200, 'AI Assistant conversation history retrieved successfully.', data);
});

const getConversationById = asyncHandler(async (req, res) => {
  const data = await service.getConversationById(req.params.id, req.user._id);
  sendSuccess(res, 200, 'AI Assistant conversation retrieved successfully.', data);
});

const deleteConversation = asyncHandler(async (req, res) => {
  const data = await service.deleteConversation(req.params.id, req.user._id);
  sendSuccess(res, 200, 'AI Assistant conversation deleted successfully.', data);
});

module.exports = {
  getDetails,
  chat,
  getHistory,
  getConversationById,
  deleteConversation,
};
