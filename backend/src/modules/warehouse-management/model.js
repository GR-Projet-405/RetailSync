const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  manager: {
    type: String,
    required: true,
    trim: true
  },
  totalCapacity: {
    type: Number,
    required: true,
    default: 5000
  },
  usedCapacity: {
    type: Number,
    required: true,
    default: 0
  },
  totalLocations: {
    type: Number,
    required: true,
    default: 120
  },
  activeSkus: {
    type: Number,
    required: true,
    default: 12
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Inactive'],
    default: 'Active'
  },
  zoneData: [{
    zone: String,
    total: Number,
    used: Number,
    category: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
