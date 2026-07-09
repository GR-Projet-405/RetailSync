const mongoose = require('mongoose');

const discountRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Discount rule name is required'],
      trim: true,
      maxlength: [100, 'Discount rule name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Discount rule type is required'],
      enum: {
        values: ['Cart Total', 'Product Category', 'Customer Type', 'Day Based', 'Quantity Based'],
        message: 'Type must be Cart Total, Product Category, Customer Type, Day Based, or Quantity Based',
      },
      default: 'Cart Total',
    },
    condition: {
      type: String,
      required: [true, 'Condition details are required'],
      trim: true,
    },
    discountLimit: {
      type: String,
      required: [true, 'Discount limit is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Active', 'Expired'],
        message: 'Status must be Active or Expired',
      },
      default: 'Active',
    },
    priority: {
      type: Number,
      required: [true, 'Priority weight is required'],
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
discountRuleSchema.index({ status: 1 });
discountRuleSchema.index({ priority: 1 });
discountRuleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('DiscountRule', discountRuleSchema);
