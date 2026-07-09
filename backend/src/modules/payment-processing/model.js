const mongoose = require('mongoose');


// 1. Customer Schema

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 }
}, { timestamps: true });


// 2. Transaction Schema

const TransactionSchema = new mongoose.Schema({

  // Link to the customer (Guest = null)
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },

  // Link to the User (Cashier) who processed the payment
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

  // if the transaction is refunded, this field will store the total refunded amount
  refundedAmount: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = {
  Customer: mongoose.model('Customer', CustomerSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema)
};