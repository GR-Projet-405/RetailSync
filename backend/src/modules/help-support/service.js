const HelpSupportTicket = require('./model');

class HelpSupportService {
  async getTickets(filters = {}) {
    const query = {};

    if (filters.status && filters.status !== 'All Status') {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const tickets = await HelpSupportTicket.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return tickets;
  }

  async getTicketById(id) {
    const ticket = await HelpSupportTicket.findById(id).lean();

    if (!ticket) {
      const error = new Error('Support ticket not found');
      error.statusCode = 404;
      throw error;
    }

    return ticket;
  }

  async createTicket(payload) {
    const ticketId = await this.generateTicketId();

    const ticket = await HelpSupportTicket.create({
      ticketId,
      subject: payload.subject,
      category: payload.category,
      priority: payload.priority || 'Med',
      description: payload.description,
      status: 'Open',
      attachments: payload.attachments || [],
      messages: [
        {
          senderType: 'customer',
          senderName: payload.senderName || 'Customer',
          text: payload.description,
        },
      ],
    });

    return ticket;
  }

  async addMessage(ticketMongoId, payload) {
    const ticket = await HelpSupportTicket.findById(ticketMongoId);

    if (!ticket) {
      const error = new Error('Support ticket not found');
      error.statusCode = 404;
      throw error;
    }

    ticket.messages.push({
      senderType: payload.senderType || 'customer',
      senderName: payload.senderName || 'Customer',
      text: payload.text,
    });

    await ticket.save();

    return ticket;
  }

  async updateTicketStatus(ticketMongoId, status) {
    const ticket = await HelpSupportTicket.findByIdAndUpdate(
      ticketMongoId,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!ticket) {
      const error = new Error('Support ticket not found');
      error.statusCode = 404;
      throw error;
    }

    return ticket;
  }

  async generateTicketId() {
    const lastTicket = await HelpSupportTicket.findOne()
      .sort({ createdAt: -1 })
      .select('ticketId')
      .lean();

    if (!lastTicket?.ticketId) {
      return 'JK-2983';
    }

    const lastNumber = Number(lastTicket.ticketId.replace('JK-', ''));
    const nextNumber = Number.isNaN(lastNumber) ? 2983 : lastNumber + 1;

    return `JK-${nextNumber}`;
  }
}

module.exports = new HelpSupportService();
