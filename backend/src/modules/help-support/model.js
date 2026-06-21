const mongoose = require('mongoose');

const HelpSupportPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('HelpSupportPage', HelpSupportPageSchema);
