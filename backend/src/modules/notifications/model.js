const mongoose = require('mongoose');

const NotificationsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('NotificationsPage', NotificationsPageSchema);
