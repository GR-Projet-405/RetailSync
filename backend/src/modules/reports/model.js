const mongoose = require('mongoose');

const ReportsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ReportsPage', ReportsPageSchema);
