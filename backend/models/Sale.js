const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    product: {
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
    transactionId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier is required (BR-SALE-005)'],
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
    discountTotal: {
      type: Number,
      default: 0,
      min: [0, 'Discount total cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'qr_pay', 'bank_transfer'],
        message: '{VALUE} is not a supported payment method',
      },
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'pending', 'refunded', 'cancelled'],
        message: '{VALUE} is not a valid sale status',
      },
      default: 'completed',
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.pre('save', async function (next) {
  if (this.isNew && !this.transactionId) {
    const count = await this.constructor.countDocuments();
    this.transactionId = `TXN-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

saleSchema.pre('save', async function (next) {
  if (!this.isNew) {
    const original = await this.constructor.findById(this._id).select('status');

    if (original?.status === 'completed') {
      return next(
        new Error(
          'Completed sales cannot be modified (BR-SALE-001). Use the return/refund workflow.'
        )
      );
    }
  }

  next();
});

const blockCompletedSaleUpdates = async function (next) {
  const doc = await this.model.findOne(this.getQuery()).select('status');

  if (doc?.status === 'completed') {
    return next(
      new Error(
        'Completed sales cannot be modified (BR-SALE-001). Use the return/refund workflow.'
      )
    );
  }

  next();
};

saleSchema.pre('findOneAndUpdate', blockCompletedSaleUpdates);
saleSchema.pre('updateOne', blockCompletedSaleUpdates);

saleSchema.index({ branch: 1, createdAt: -1 });
saleSchema.index({ cashier: 1, createdAt: -1 });
saleSchema.index({ customer: 1, createdAt: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ 'items.product': 1 });

module.exports = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
