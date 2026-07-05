const mongoose = require('mongoose');

const SUBJECT_OPTIONS = [
  'Technical Issue',
  'Billing',
  'Account Access',
  'Feature Request',
  'Other',
];

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
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

const contactMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      enum: SUBJECT_OPTIONS,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Archived'],
      default: 'New',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);