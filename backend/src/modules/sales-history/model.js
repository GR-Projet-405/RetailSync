const mongoose = require('mongoose');

const SalesHistoryPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('SalesHistoryPage', SalesHistoryPageSchema);
