const mongoose = require('mongoose');

const POSBillingPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('POSBillingPage', POSBillingPageSchema);
