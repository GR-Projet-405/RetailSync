const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ name: 1 });

// 🔑 Registered as 'Supplier' (not 'SupplierPage') so it matches
// `ref: "Supplier"` in your Goods Receiving model.
module.exports = mongoose.model('Supplier', SupplierSchema);
