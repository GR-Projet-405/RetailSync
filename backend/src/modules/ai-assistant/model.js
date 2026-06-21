const mongoose = require('mongoose');

const AIAssistantPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AIAssistantPage', AIAssistantPageSchema);
