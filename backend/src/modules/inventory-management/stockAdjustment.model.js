const mongoose = require('mongoose');

const ADJUSTMENT_TYPES = ['ADD', 'REMOVE'];

const ADJUSTMENT_REASONS = [
  'DAMAGED',
  'EXPIRED',
  'SUPPLIER_DELIVERY',
  'FOUND_SURPLUS',
  'THEFT_LOSS',
  'SYSTEM_CORRECTION',
  'RETURN_TO_SUPPLIER',
  'OTHER',
];

const ADJUSTMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentId: {
      type: String,
      unique: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    type: {
      type: String,
      enum: ADJUSTMENT_TYPES,
      required: [true, 'Adjustment type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    reason: {
      type: String,
      enum: ADJUSTMENT_REASONS,
      required: [true, 'Reason is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
    evidenceUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ADJUSTMENT_STATUSES,
      default: 'PENDING',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested by is required'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate adjustmentId: ADJ-XXXXX
stockAdjustmentSchema.pre('save', async function (next) {
  if (!this.adjustmentId) {
    const count = await mongoose.model('StockAdjustment').countDocuments();
    this.adjustmentId = `ADJ-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

stockAdjustmentSchema.index({ productId: 1 });
stockAdjustmentSchema.index({ warehouseId: 1 });
stockAdjustmentSchema.index({ status: 1 });
stockAdjustmentSchema.index({ requestedBy: 1 });
stockAdjustmentSchema.index({ createdAt: -1 });

module.exports = mongoose.models.StockAdjustment || mongoose.model('StockAdjustment', stockAdjustmentSchema);
