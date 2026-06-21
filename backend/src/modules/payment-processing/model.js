const mongoose = require('mongoose');

const PaymentProcessingPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('PaymentProcessingPage', PaymentProcessingPageSchema);
