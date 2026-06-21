const mongoose = require('mongoose');

const CategoryPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('CategoryPage', CategoryPageSchema);
