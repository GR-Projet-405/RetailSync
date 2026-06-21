const mongoose = require('mongoose');

const AIReorderingPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AIReorderingPage', AIReorderingPageSchema);
