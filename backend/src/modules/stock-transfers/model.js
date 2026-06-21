const mongoose = require('mongoose');

const StockTransferPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('StockTransferPage', StockTransferPageSchema);
