const mongoose = require('mongoose');

const assistantMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
      maxlength: [4000, 'Message content cannot exceed 4000 characters'],
    },
    intent: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const assistantConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Conversation title cannot exceed 120 characters'],
      default: 'RetailSync Assistant Chat',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    lastIntent: {
      type: String,
      trim: true,
      default: '',
    },
    contextUsed: [
      {
        type: String,
        trim: true,
      },
    ],
    messages: {
      type: [assistantMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

assistantConversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('AIAssistantConversation', assistantConversationSchema);
