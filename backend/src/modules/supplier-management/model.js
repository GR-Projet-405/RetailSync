const mongoose = require('mongoose');

const SupplierPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('SupplierPage', SupplierPageSchema);
