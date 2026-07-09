const mongoose = require('mongoose');
require('../branch-management/branch.model');
require('../product-management/model');
require('../user-management/user.model');

const stockTransferItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantityTransferred: {
    type: Number,
    required: true,
    min: [1, 'Quantity to transfer must be at least 1'],
  },
  quantityReceived: {
    type: Number,
    default: 0,
    min: [0, 'Quantity received cannot be negative'],
  },
});

const stockTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Source branch is required'],
    },
    destinationBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Destination branch is required'],
    },
    items: [stockTransferItemSchema],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverName: {
      type: String,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedTime: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    shipmentDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        updatedAt: { type: Date, default: Date.now },
        notes: { type: String },
      }
    ],
  },
  {
    timestamps: true,
  }
);

stockTransferSchema.index({ sourceBranch: 1 });
stockTransferSchema.index({ destinationBranch: 1 });
stockTransferSchema.index({ status: 1 });

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
