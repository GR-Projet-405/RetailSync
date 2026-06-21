const mongoose = require('mongoose');

const InventoryPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('InventoryPage', InventoryPageSchema);
