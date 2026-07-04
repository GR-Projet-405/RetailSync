const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getTickets = asyncHandler(async (req, res) => {
  const tickets = await service.getTickets(req.query);

  res.status(200).json({
    success: true,
    message: 'Support tickets fetched successfully.',
    data: tickets,
  });
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await service.getTicketById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Support ticket fetched successfully.',
    data: ticket,
  });
});

const createTicket = asyncHandler(async (req, res) => {
  const ticket = await service.createTicket(req.body);

  res.status(201).json({
    success: true,
    message: 'Support ticket created successfully.',
    data: ticket,
  });
});

const addMessage = asyncHandler(async (req, res) => {
  const ticket = await service.addMessage(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Message added successfully.',
    data: ticket,
  });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await service.updateTicketStatus(req.params.id, req.body.status);

  res.status(200).json({
    success: true,
    message: 'Ticket status updated successfully.',
    data: ticket,
  });
});

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  addMessage,
  updateTicketStatus,
};