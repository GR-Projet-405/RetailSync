const mongoose = require('mongoose');

const ReturnsRefundsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ReturnsRefundsPage', ReturnsRefundsPageSchema);
