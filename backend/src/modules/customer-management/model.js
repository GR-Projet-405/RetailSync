const mongoose = require('mongoose');

const CustomerPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('CustomerPage', CustomerPageSchema);
