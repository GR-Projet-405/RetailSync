const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    module: {
      type: String,
      required: true,
      enum: ['BRANCH', 'USER', 'INVENTORY', 'SALES', 'SETTINGS', 'SYSTEM'],
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'ACTIVATE',
        'DEACTIVATE',
        'ASSIGN_MANAGER',
        'REASSIGN_MANAGER',
        'LOGIN',
        'LOGOUT',
      ],
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    oldValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    action: {
      type: String,
    },
    description: {
      type: String,
    },
    eventType: {
      type: String,
      enum: ['User Action', 'System Event', 'Security Alert'],
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'WARNING'],
      default: 'SUCCESS',
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
