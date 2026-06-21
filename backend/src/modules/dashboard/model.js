const mongoose = require('mongoose');

const DashboardPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('DashboardPage', DashboardPageSchema);
