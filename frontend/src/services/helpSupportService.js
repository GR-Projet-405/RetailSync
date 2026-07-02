import api from './api';

const formatDate = (dateValue) => {
  if (!dateValue) return '';

  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatMessageTime = (dateValue) => {
  if (!dateValue) return '';

  return new Date(dateValue).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const mapMessage = (message) => ({
  id: message._id,
  type: message.senderType === 'customer' ? 'user' : message.senderType,
  sender: message.senderName,
  text: message.text,
  time: formatMessageTime(message.createdAt),
});

const mapTicket = (ticket) => ({
  id: ticket._id,
  ticketId: ticket.ticketId,
  subject: ticket.subject,
  category: ticket.category,
  date: formatDate(ticket.createdAt),
  status: ticket.status,
  priority: ticket.priority,
  description: ticket.description,
  messages: ticket.messages?.map(mapMessage) || [],
});

export const getSupportTickets = async () => {
  const response = await api.get('/help-support');
  return response.data.data.map(mapTicket);
};

export const createSupportTicket = async (payload) => {
  const response = await api.post('/help-support', payload);
  return mapTicket(response.data.data);
};

export const addSupportTicketMessage = async (ticketId, payload) => {
  const response = await api.post(`/help-support/${ticketId}/messages`, payload);
  return mapTicket(response.data.data);
};

export const updateSupportTicketStatus = async (ticketId, status) => {
  const response = await api.patch(`/help-support/${ticketId}/status`, { status });
  return mapTicket(response.data.data);
};