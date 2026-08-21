const mongoose = require('mongoose');

// 1. Transaction Schema 
const TransactionSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true },

  // Link to the centralized Customer model
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Array to store the purchased items from the Cart
  items: [{
    name: { type: String },
    category: { type: String },
    sku: { type: String },
    qty: { type: Number },
    originalPrice: { type: Number },
    price: { type: Number },
    total: { type: Number }
  }],

  // Bill Details (Summary)
  subTotal: { type: Number, required: true },
  posDiscount: { type: Number, default: 0 },
  memberDiscount: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true },
  finalTotal: { type: Number, required: true },

  // Points Tracking
  pointsRedeemed: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },

  // Payment Method Details
  paymentMethod: { type: String, enum: ['cash', 'card', 'qr'], required: true },
  tenderedAmount: { type: Number, default: 0 },
  changeDue: { type: Number, default: 0 },
  cardLastFourDigits: { type: String, default: '' },

  // Transaction Status
  status: {
    type: String,
    enum: ['Completed', 'Refunded', 'Pending'],
    default: 'Completed'
  },
  refundedAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Export the Transaction model
module.exports = {
  Transaction: mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)
};