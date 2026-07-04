const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: [150, 'Supplier name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      street:  { type: String, trim: true, default: null },
      city:    { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: 'Sri Lanka' },
    },
    paymentTerms: {
      type: String,
      enum: ['IMMEDIATE', 'NET_15', 'NET_30', 'NET_60', 'NET_90'],
      default: 'NET_30',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'],
      default: 'ACTIVE',
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate supplier code before first save
supplierSchema.pre('save', function (next) {
  if (!this.code) {
    const ts  = Date.now().toString().slice(-5);
    const rnd = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.code = `SUP-${ts}-${rnd}`;
  }
  next();
});

supplierSchema.index({ status: 1 });
supplierSchema.index({ name: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
