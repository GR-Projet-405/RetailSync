const mongoose = require('mongoose');

const ProfileSettingsPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.models.ProfileSettingsPage || mongoose.model('ProfileSettingsPage', ProfileSettingsPageSchema);
