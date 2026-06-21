const mongoose = require('mongoose');

const PromotionsDiscountsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('PromotionsDiscountsPage', PromotionsDiscountsPageSchema);
