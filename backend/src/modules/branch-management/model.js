const mongoose = require('mongoose');

const BranchPageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('BranchPage', BranchPageSchema);
