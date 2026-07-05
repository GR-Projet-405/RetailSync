const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
    },
    lineTotal: {
      type: Number,
      required: [true, 'Line total is required'],
      min: [0, 'Line total cannot be negative'],
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    items: {
      type: [saleItemSchema],
      required: [true, 'Sale items are required'],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'A sale must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    cartDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Cart discount cannot be negative'],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'digital_wallet'],
        message: '{VALUE} is not a supported payment method',
      },
      required: [true, 'Payment method is required'],
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [0, 'Amount paid cannot be negative'],
    },
    changeGiven: {
      type: Number,
      default: 0,
      min: [0, 'Change given cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'partially_returned', 'returned', 'refunded'],
        message: '{VALUE} is not a valid sale status',
      },
      default: 'completed',
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Loyalty points cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({ branchId: 1, completedAt: -1 });
saleSchema.index({ cashierId: 1, completedAt: -1 });
saleSchema.index({ customerId: 1, completedAt: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ 'items.productId': 1 });
saleSchema.index({ 'items.category': 1 });

module.exports = mongoose.model('Sale', saleSchema);
