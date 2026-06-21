const mongoose = require('mongoose');

const GoodsReceivingPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('GoodsReceivingPage', GoodsReceivingPageSchema);
