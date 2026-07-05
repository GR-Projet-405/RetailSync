const ContactMessage = require('./model');

class ContactSupportService {
  async getMessages(filters = {}) {
    const query = {};

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.subject) {
      query.subject = filters.subject;
    }

    return ContactMessage.find(query).sort({ createdAt: -1 }).lean();
  }

  async getMessageById(id) {
    const contactMessage = await ContactMessage.findById(id).lean();

    if (!contactMessage) {
      const error = new Error('Contact message not found');
      error.statusCode = 404;
      throw error;
    }

    return contactMessage;
  }

  async createMessage(payload) {
    const messageId = await this.generateMessageId();

    const contactMessage = await ContactMessage.create({
      messageId,
      fullName: payload.fullName,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      status: 'New',
    });

    return contactMessage;
  }

  async updateMessageStatus(id, status) {
    const contactMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!contactMessage) {
      const error = new Error('Contact message not found');
      error.statusCode = 404;
      throw error;
    }

    return contactMessage;
  }

  async generateMessageId() {
    const lastMessage = await ContactMessage.findOne()
      .sort({ createdAt: -1 })
      .select('messageId')
      .lean();

    if (!lastMessage?.messageId) {
      return 'CM-1001';
    }

    const lastNumber = Number(lastMessage.messageId.replace('CM-', ''));
    const nextNumber = Number.isNaN(lastNumber) ? 1001 : lastNumber + 1;

    return `CM-${nextNumber}`;
  }
}

module.exports = new ContactSupportService();