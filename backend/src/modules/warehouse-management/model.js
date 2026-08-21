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
      default: 5000,
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

// Virtuals for frontend backward-compatibility
warehouseSchema.virtual('address').get(function () {
  return this.location?.address;
});

warehouseSchema.virtual('city').get(function () {
  return this.location?.city;
});

warehouseSchema.virtual('totalCapacity').get(function () {
  return this.capacity || 5000;
});

warehouseSchema.virtual('manager').get(function () {
  if (this.managerId && typeof this.managerId === 'object') {
    return `${this.managerId.firstName || ''} ${this.managerId.lastName || ''}`.trim() || this.managerId.username || 'Unassigned';
  }
  return 'Unassigned';
});

// Ensure virtuals are output in JSON and Objects
warehouseSchema.set('toJSON', { virtuals: true });
warehouseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
