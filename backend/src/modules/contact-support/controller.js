const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getMessages = asyncHandler(async (req, res) => {
  const messages = await service.getMessages(req.query);

  res.status(200).json({
    success: true,
    message: 'Contact messages fetched successfully.',
    data: messages,
  });
});

const getMessageById = asyncHandler(async (req, res) => {
  const contactMessage = await service.getMessageById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Contact message fetched successfully.',
    data: contactMessage,
  });
});

const createMessage = asyncHandler(async (req, res) => {
  const contactMessage = await service.createMessage(req.body);

  res.status(201).json({
    success: true,
    message: 'Contact message submitted successfully.',
    data: contactMessage,
  });
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const contactMessage = await service.updateMessageStatus(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: 'Contact message status updated successfully.',
    data: contactMessage,
  });
});

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessageStatus,
};