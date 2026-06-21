const mongoose = require('mongoose');

const WarehousePageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('WarehousePage', WarehousePageSchema);
