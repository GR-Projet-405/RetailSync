const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Coupon name/title is required'],
      trim: true,
      maxlength: [100, 'Coupon name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, 'Coupon code cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: ['Percentage', 'Fixed Amount', 'Free Shipping'],
        message: 'Discount type must be Percentage, Fixed Amount, or Free Shipping',
      },
      default: 'Percentage',
    },
    discountValue: {
      type: Number,
      required: [
        function () {
          return this.discountType !== 'Free Shipping';
        },
        'Discount value is required when type is not Free Shipping',
      ],
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null represents 'Unlimited'
    },
    perCustomerLimit: {
      type: Number,
      default: 1, // default 1 use per customer
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Active', 'Paused', 'Expired'],
        message: 'Status must be Active, Paused, or Expired',
      },
      default: 'Active',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null, // null represents 'All Branches'
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      default: null, // null means not linked to a parent Promotion
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
couponSchema.index({ status: 1 });
couponSchema.index({ branchId: 1 });
couponSchema.index({ promotionId: 1 });
couponSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
