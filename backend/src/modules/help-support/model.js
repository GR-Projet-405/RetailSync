const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ['customer', 'agent', 'system'],
      default: 'customer',
    },
    senderName: {
      type: String,
      trim: true,
      default: 'Customer',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const helpSupportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical Issue', 'Billing', 'Account Access', 'Feature Request', 'Other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Med', 'Low'],
      default: 'Med',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    attachments: [attachmentSchema],
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HelpSupportTicket', helpSupportTicketSchema);