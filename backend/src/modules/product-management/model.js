const mongoose = require('mongoose');

const ProductPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ProductPage', ProductPageSchema);