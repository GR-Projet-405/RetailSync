const mongoose = require('mongoose');

// 1. Customer Schema
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // Phone number is unique
  email: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 } // Starts with 0 points
}, { timestamps: true });

// 2. Transaction Schema
const TransactionSchema = new mongoose.Schema({
  // If guest, this will be null
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
    price: { type: Number }, // Price after any item-level discounts
    total: { type: Number }
  }],

  // Bill Details
  subTotal: { type: Number, required: true },
  memberDiscount: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true },
  finalTotal: { type: Number, required: true },

  // Points
  pointsRedeemed: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },

  // Payment Details
  paymentMethod: { type: String, enum: ['cash', 'card', 'qr'], required: true },
  tenderedAmount: { type: Number, default: 0 },
  changeDue: { type: Number, default: 0 },
  cardLastFourDigits: { type: String, default: '' }
}, { timestamps: true });

// Export both models
module.exports = {
  Customer: mongoose.model('Customer', CustomerSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema)
};