const mongoose = require('mongoose');

const AuthPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AuthPage', AuthPageSchema);
