const mongoose = require('mongoose');

// ─── Contact Sub-Schema ───────────────────────────────────────────────────────
const ContactSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  role:     { type: String },
  email:    { type: String, required: true },
  phone:    { type: String },
  tags:     [{ type: String }],
  isPrimary: { type: Boolean, default: false },
}, { _id: true });

// ─── Address Sub-Schema ───────────────────────────────────────────────────────
const AddressSchema = new mongoose.Schema({
  street:  { type: String },
  city:    { type: String },
  state:   { type: String },
  zip:     { type: String },
  country: { type: String },
  taxId:   { type: String },
}, { _id: false });

// ─── Payment Sub-Schema ───────────────────────────────────────────────────────
const PaymentSchema = new mongoose.Schema({
  terms:        { type: String, enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'COD', 'Prepaid'] },
  currency:     { type: String, default: 'USD' },
  bankName:     { type: String },
  accountHolder:{ type: String },
  accountNumber:{ type: String }, // stored masked
  routingNumber:{ type: String },
  billingAddress: AddressSchema,
}, { _id: false });

// ─── Performance Sub-Schema ───────────────────────────────────────────────────
const PerformanceSchema = new mongoose.Schema({
  onTimeDelivery: { type: Number, min: 0, max: 100, default: 0 },
  qualityScore:   { type: Number, min: 0, max: 100, default: 0 },
  responseTime:   { type: Number, min: 0, default: 0 }, // hours
  defectRate:     { type: Number, min: 0, max: 100, default: 0 },
  ytdSpend:       { type: Number, default: 0 },
}, { _id: false });

// ─── Document Sub-Schema ──────────────────────────────────────────────────────
const DocumentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  type:       { type: String, enum: ['contract', 'iso', 'w9', 'insurance', 'other'], default: 'other' },
  url:        { type: String },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
}, { _id: true, timestamps: false });

// ─── Compliance Sub-Schema ────────────────────────────────────────────────────
const ComplianceSchema = new mongoose.Schema({
  taxId:             { type: String },
  businessReg:       { type: String },
  complianceStatus:  { type: String, enum: ['Fully Compliant', 'Conditionally Compliant', 'Under Review', 'Non-Compliant'] },
  certifications:    [{ type: String }],
  insuranceProvider: { type: String },
  policyNumber:      { type: String },
  policyExpiry:      { type: Date },
  coverageAmount:    { type: String },
}, { _id: false });

// ─── Main Supplier Schema ─────────────────────────────────────────────────────
const SupplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    unique: true,
    // Auto-generated as SUP-NNN on save
  },
  name:             { type: String, required: true, trim: true },
  businessType:     { type: String, enum: ['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Farmer/Co-op', 'Service Provider'] },
  industryCategory: { type: String, required: true },
  country:          { type: String },
  yearEstablished:  { type: Number, min: 1800, max: 2100 },
  employees:        { type: String },
  revenue:          { type: String },
  description:      { type: String },
  registrationNumber: { type: String },
  website:          { type: String },
  linkedin:         { type: String },
  preferredComm:    { type: String },

  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending',
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },

  // Nested sub-documents
  address:    AddressSchema,
  payment:    PaymentSchema,
  performance: PerformanceSchema,
  compliance: ComplianceSchema,
  contacts:   [ContactSchema],
  documents:  [DocumentSchema],
}, {
  timestamps: true,
});

// ─── Auto-generate supplierId before save ─────────────────────────────────────
SupplierSchema.pre('save', async function (next) {
  if (this.supplierId) return next();
  const count = await mongoose.model('Supplier').countDocuments();
  this.supplierId = `SUP-${String(count + 1).padStart(3, '0')}`;
  next();
});

module.exports = mongoose.model('Supplier', SupplierSchema);
