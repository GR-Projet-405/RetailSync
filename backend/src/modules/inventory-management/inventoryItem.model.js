const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
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
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: [0, 'Reorder level cannot be negative'],
    },
    lastMovementAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// One record per product per warehouse
inventoryItemSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });
inventoryItemSchema.index({ warehouseId: 1 });
inventoryItemSchema.index({ currentStock: 1 });

// Available stock = current - reserved
inventoryItemSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.currentStock - this.reservedStock);
});

// Stock status derived from reorder level
inventoryItemSchema.virtual('stockStatus').get(function () {
  if (this.currentStock === 0)                        return 'OUT_OF_STOCK';
  if (this.currentStock <= this.reorderLevel * 0.5)  return 'CRITICAL';
  if (this.currentStock <= this.reorderLevel)         return 'LOW_STOCK';
  return 'IN_STOCK';
});

module.exports = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
