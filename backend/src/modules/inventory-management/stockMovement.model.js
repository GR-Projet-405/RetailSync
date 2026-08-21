const mongoose = require('mongoose');

const MOVEMENT_TYPES = [
  'SALE',
  'PURCHASE',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT_ADD',
  'ADJUSTMENT_REMOVE',
  'RETURN_IN',
  'RETURN_OUT',
  'DAMAGE_WRITE_OFF',
];

const MOVEMENT_STATUSES = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];

const stockMovementSchema = new mongoose.Schema(
  {
    movementId: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: MOVEMENT_TYPES,
      required: [true, 'Movement type is required'],
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
    // Destination warehouse — only for TRANSFER_IN / TRANSFER_OUT
    toWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    // unitCost at time of movement (for valuation)
    unitCost: {
      type: Number,
      default: null,
    },
    // Links to external docs: PO number, transfer ID, adjustment ID, sale invoice
    referenceId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: MOVEMENT_STATUSES,
      default: 'COMPLETED',
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by is required'],
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate movementId: MOV-XXXXXX
stockMovementSchema.pre('save', async function (next) {
  if (!this.movementId) {
    const count = await mongoose.model('StockMovement').countDocuments();
    this.movementId = `MOV-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

stockMovementSchema.index({ productId: 1 });
stockMovementSchema.index({ warehouseId: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ performedAt: -1 });
stockMovementSchema.index({ referenceId: 1 });

module.exports = mongoose.models.StockMovement || mongoose.model('StockMovement', stockMovementSchema);
