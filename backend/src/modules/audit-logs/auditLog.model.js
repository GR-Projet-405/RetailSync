const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
