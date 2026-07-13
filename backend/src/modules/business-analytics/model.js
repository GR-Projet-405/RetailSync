const mongoose = require('mongoose');

const BusinessAnalyticsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('BusinessAnalyticsPage', BusinessAnalyticsPageSchema);
