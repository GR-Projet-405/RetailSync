const mongoose = require('mongoose');

const ReturnedItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  originalQty: { type: Number, required: true }, 
  returnQty: { type: Number, required: true, min: 1 }, 
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  reason: { type: String, required: true }, 
  condition: { type: String, enum: ['Opened', 'Sealed'], default: 'Opened' },
  comments: { type: String, default: '' },
  photoProofUrl: { type: String, default: '' }
});

const ReturnsRefundsPageSchema = new mongoose.Schema({
  returnId: { type: String, required: true, unique: true }, 
  receiptId: { type: String, required: true }, 

  transactionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },

  items: [ReturnedItemSchema],

  estimatedRefundTotal: { type: Number, required: true }, 

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Refund Issued', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  refundMethod: { type: String, enum: ['cash', 'card', 'ezcash', 'mcash', 'frimi', null], default: null },
  internalNotes: { type: String, default: '' },

  pointsDeducted: { type: Number, default: 0 }

}, {
  timestamps: true
});

module.exports = mongoose.model('ReturnsRefundsPage', ReturnsRefundsPageSchema);

