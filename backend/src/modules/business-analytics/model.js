const mongoose = require('mongoose');

const productMetricSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductPage',
      default: null,
    },
    sku: {
      type: String,
      trim: true,
      required: [true, 'Product SKU is required'],
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Product name is required'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Uncategorized',
    },
    quantitySold: {
      type: Number,
      min: 0,
      default: 0,
    },
    revenue: {
      type: Number,
      min: 0,
      default: 0,
    },
    grossProfit: {
      type: Number,
      default: 0,
    },
    currentStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      min: 0,
      default: 0,
    },
    daysOfSupply: {
      type: Number,
      min: 0,
      default: 0,
    },
    inventoryStatus: {
      type: String,
      enum: ['HEALTHY', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'DEAD_STOCK'],
      default: 'HEALTHY',
    },
  },
  { _id: false }
);

const businessAnalyticsSnapshotSchema = new mongoose.Schema(
  {
    snapshotDate: {
      type: Date,
      required: [true, 'Snapshot date is required'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true,
    },
    branchName: {
      type: String,
      trim: true,
      default: 'All Branches',
    },
    branchCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'ALL',
    },
    channel: {
      type: String,
      enum: ['POS', 'ONLINE', 'WHOLESALE', 'MIXED'],
      default: 'POS',
    },
    sales: {
      orderCount: { type: Number, min: 0, default: 0 },
      itemCount: { type: Number, min: 0, default: 0 },
      grossRevenue: { type: Number, min: 0, default: 0 },
      discounts: { type: Number, min: 0, default: 0 },
      tax: { type: Number, min: 0, default: 0 },
      refunds: { type: Number, min: 0, default: 0 },
      netRevenue: { type: Number, min: 0, default: 0 },
      cogs: { type: Number, min: 0, default: 0 },
    },
    inventory: {
      totalSkuCount: { type: Number, min: 0, default: 0 },
      lowStockCount: { type: Number, min: 0, default: 0 },
      outOfStockCount: { type: Number, min: 0, default: 0 },
      overstockCount: { type: Number, min: 0, default: 0 },
      deadStockCount: { type: Number, min: 0, default: 0 },
      stockValue: { type: Number, min: 0, default: 0 },
    },
    customers: {
      newCustomers: { type: Number, min: 0, default: 0 },
      returningCustomers: { type: Number, min: 0, default: 0 },
      loyaltyPointsIssued: { type: Number, min: 0, default: 0 },
    },
    products: {
      type: [productMetricSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

businessAnalyticsSnapshotSchema.virtual('grossProfit').get(function () {
  return (this.sales?.netRevenue || 0) - (this.sales?.cogs || 0);
});

businessAnalyticsSnapshotSchema.index({ snapshotDate: -1, branchId: 1 });
businessAnalyticsSnapshotSchema.index({ branchCode: 1, snapshotDate: -1 });
businessAnalyticsSnapshotSchema.index({ channel: 1, snapshotDate: -1 });

module.exports = mongoose.model('BusinessAnalyticsSnapshot', businessAnalyticsSnapshotSchema);
