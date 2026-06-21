const mongoose = require('mongoose');

const AuditLogsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AuditLogsPage', AuditLogsPageSchema);
