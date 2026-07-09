const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
      maxlength: [100, 'Warehouse name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Warehouse code cannot exceed 20 characters'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    location: {
      address: { type: String, trim: true, default: null },
      city:    { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: 'Sri Lanka' },
    },
    contactPhone: {
      type: String,
      trim: true,
      default: null,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    capacity: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

warehouseSchema.index({ branchId: 1 });
warehouseSchema.index({ status: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
