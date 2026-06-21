const mongoose = require('mongoose');

const PurchaseOrderPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('PurchaseOrderPage', PurchaseOrderPageSchema);
