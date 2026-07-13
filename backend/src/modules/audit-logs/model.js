const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Branch Manager', 'Inventory Manager', 'Cashier', 'Auditor', 'System'],
    required: true
  },
  module: {
    type: String,
    enum: ['Inventory', 'Sales', 'Auth', 'System', 'Products', 'Customers', 'Employees', 'Branches', 'Reports'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['User Action', 'System Event', 'Security Alert'],
    required: true
  },
  location: {
    type: String,
    enum: ['Downtown', 'Uptown', 'Warehouse', 'System'],
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'WARNING', 'FAILED'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true 
});

// Index for better query performance
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ module: 1 });
AuditLogSchema.index({ location: 1 });
AuditLogSchema.index({ eventType: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
