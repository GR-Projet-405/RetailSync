const mongoose = require('mongoose');

const EmployeePageSchema = new mongoose.Schema({
  // Mongoose schema declaration boilerplate
}, { 
  timestamps: true 
});

module.exports = mongoose.model('EmployeePage', EmployeePageSchema);
