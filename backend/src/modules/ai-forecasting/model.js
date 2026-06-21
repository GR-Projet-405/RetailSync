const mongoose = require('mongoose');

const AIForecastingPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AIForecastingPage', AIForecastingPageSchema);
