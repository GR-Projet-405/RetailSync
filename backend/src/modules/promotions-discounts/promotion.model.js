const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Promotion name is required'],
      trim: true,
      maxlength: [150, 'Promotion name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discount: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: {
        values: ['Percentage', 'Fixed Amount', 'Free Shipping'],
        message: 'Type must be either Percentage, Fixed Amount, or Free Shipping',
      },
      default: 'Percentage',
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Draft', 'Active', 'Scheduled', 'Expired'],
        message: 'Status must be Draft, Active, Scheduled, or Expired',
      },
      default: 'Draft',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null, // null represents 'All Branches'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User ID is required'],
    },
    revenue: {
      type: Number,
      default: 0,
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    usagesCount: {
      type: Number,
      default: 0,
    },
    roi: {
      type: String,
      default: '0.0x',
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
promotionSchema.index({ status: 1 });
promotionSchema.index({ branchId: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
