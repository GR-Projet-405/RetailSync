const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: [0, 'Reorder level cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ productId: 1, branchId: 1 }, { unique: true });
inventorySchema.index({ branchId: 1 });

// Pre-load all inventory models so they are registered with Mongoose
// before any populate() calls reference them.
require('./inventoryItem.model');
require('./stockMovement.model');
require('./stockAdjustment.model');

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
