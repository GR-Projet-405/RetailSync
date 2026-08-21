const mongoose = require('mongoose');
require('../user-management/user.model');

// ─── Line Item Sub-Schema ──────────────────────────────────────────────────
const LineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // fixed: matches mongoose.model('Product', ProductSchema)
    required: true,
  },
  name:      { type: String, required: true },
  sku:       { type: String, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },

  // Populated by the Goods Receiving flow / tracking page's "Receive All" /
  // "Receive Partially" actions. Not yet wired to a per-item receiving UI,
  // so it defaults to 0 and is bumped to `quantity` when the whole order is
  // marked FULLY_RECEIVED (see the pre-save hook below).
  receivedQuantity: { type: Number, default: 0, min: 0 },
}, { _id: true });

// ─── Supplier Contact Snapshot Sub-Schema ──────────────────────────────────
const SupplierContactSnapshotSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  role:  { type: String },
  email: { type: String, required: true },
  phone: { type: String },
}, { _id: false });

// ─── Main Purchase Order Schema ────────────────────────────────────────────
const PurchaseOrderPageSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    unique: true,
  },

  // ── Step 1: Supplier Selection ──
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  supplierNameSnapshot: { type: String, required: true },
  supplierContact: SupplierContactSnapshotSchema,
  expectedDeliveryDate: { type: Date, required: true },
  shippingAddress: { type: String, required: true },

  // Date the PO was placed — shown as "Order Date" in the list view
  orderDate: { type: Date, default: Date.now },

  // ── Step 2: Add Items ──
  items: [LineItemSchema],

  // ── Pricing summary (Step 2 & 3) ──
  subtotal:        { type: Number, default: 0 },
  taxRate:          { type: Number, default: 8 },
  taxAmount:        { type: Number, default: 0 },
  shippingHandling: { type: Number, default: 0 },
  grandTotal:       { type: Number, default: 0 },

  // ── Step 3: Review & Submit ──
  internalNotes: { type: String, default: '' },

  // Lifecycle used by the Purchase Orders list UI:
  // DRAFT -> SENT -> PARTIALLY_RECEIVED -> FULLY_RECEIVED (or CANCELLED)
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED'],
    default: 'DRAFT',
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  submittedAt: { type: Date }, // set when the order is sent to the supplier

  // Set when the order moves into PARTIALLY_RECEIVED / FULLY_RECEIVED —
  // read by the Order Tracking page's step-tracker timestamps.
  firstReceivedAt: { type: Date },
  fullyReceivedAt: { type: Date },

  // Email delivery tracking — read/written by the Approval Workflow page's
  // email preview card and the Supplier Order Details page's "Resend Email"
  // action.
  lastEmailSentAt: { type: Date },
  emailSendCount:  { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// The list UI reads `totalAmount` — alias it to the calculated grandTotal
// so the frontend doesn't need to know the internal field name.
PurchaseOrderPageSchema.virtual('totalAmount').get(function () {
  return this.grandTotal;
});

// ─── Auto-generate poNumber before save ────────────────────────────────────
PurchaseOrderPageSchema.pre('save', async function (next) {
  if (this.poNumber) return next();

  try {
    const Model = mongoose.model('PurchaseOrderPage');
    const lastOrder = await Model.findOne({}, { poNumber: 1 })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    let maxNum = 0;
    if (lastOrder && lastOrder.poNumber) {
      const match = lastOrder.poNumber.match(/\d+/);
      if (match) {
        maxNum = parseInt(match[0], 10);
      }
    }

    let nextNum = maxNum + 1;
    let candidate = `PO-${String(nextNum).padStart(3, '0')}`;

    let exists = await Model.exists({ poNumber: candidate });
    while (exists) {
      nextNum++;
      candidate = `PO-${String(nextNum).padStart(3, '0')}`;
      exists = await Model.exists({ poNumber: candidate });
    }

    this.poNumber = candidate;
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Auto-calculate totals before save ─────────────────────────────────────
PurchaseOrderPageSchema.pre('save', function (next) {
  this.items.forEach((item) => {
    item.lineTotal = item.quantity * item.unitPrice;
  });

  this.subtotal = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  this.taxAmount = +(this.subtotal * (this.taxRate / 100)).toFixed(2);
  this.grandTotal = +(this.subtotal + this.taxAmount + this.shippingHandling).toFixed(2);

  next();
});

// ─── Stamp receiving timestamps whenever status flips to a received state ──
PurchaseOrderPageSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'PARTIALLY_RECEIVED' && !this.firstReceivedAt) {
      this.firstReceivedAt = new Date();
    }
    if (this.status === 'FULLY_RECEIVED') {
      if (!this.firstReceivedAt) this.firstReceivedAt = new Date();
      this.fullyReceivedAt = new Date();
      // Fill in receivedQuantity for any items not already fully accounted for,
      // so the tracking page's "X / Y units" progress bar reads 100%.
      this.items.forEach((item) => {
        item.receivedQuantity = item.quantity;
      });
    }
  }
  next();
});

module.exports = mongoose.model('PurchaseOrderPage', PurchaseOrderPageSchema);