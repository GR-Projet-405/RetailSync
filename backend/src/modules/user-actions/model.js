const mongoose = require('mongoose');

const UserActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      index: true
    },
    actionType: {
      type: String,
      required: [true, 'Action type is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
      index: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    device: {
      type: String,
      default: 'Unknown Device'
    }
  },
  {
    timestamps: true
  }
);

// Optimize sorting and range queries
UserActionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserAction', UserActionSchema);
