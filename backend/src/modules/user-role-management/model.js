const mongoose = require('mongoose');

const UserRolePageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('UserRolePage', UserRolePageSchema);
