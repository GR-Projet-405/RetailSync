const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    recommendationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    sku: {
      type: String,
      trim: true,
      required: [true, 'Product SKU is required'],
      index: true,
    },
    productName: {
      type: String,
      trim: true,
      required: [true, 'Product name is required'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Uncategorized',
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
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    supplierName: {
      type: String,
      trim: true,
      default: '',
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
    averageDailySales: {
      type: Number,
      min: 0,
      default: 0,
    },
    projectedStockoutDays: {
      type: Number,
      min: 0,
      default: null,
    },
    recommendedQuantity: {
      type: Number,
      min: 0,
      required: [true, 'Recommended quantity is required'],
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    urgency: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [700, 'Reason cannot exceed 700 characters'],
      required: [true, 'Recommendation reason is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CONVERTED_TO_PO'],
      default: 'PENDING',
      index: true,
    },
    decisionNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Decision note cannot exceed 500 characters'],
      default: '',
    },
    purchaseOrderDraft: {
      supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        default: null,
      },
      supplierName: {
        type: String,
        trim: true,
        default: '',
      },
      branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null,
      },
      branchName: {
        type: String,
        trim: true,
        default: '',
      },
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
          },
          sku: { type: String, trim: true },
          productName: { type: String, trim: true },
          quantity: { type: Number, min: 0 },
        },
      ],
      note: {
        type: String,
        trim: true,
        default: '',
      },
      generatedAt: {
        type: Date,
        default: null,
      },
    },
    generationConfig: {
      coverageDays: { type: Number, min: 1, default: 14 },
      leadTimeDays: { type: Number, min: 0, default: 7 },
      safetyStockDays: { type: Number, min: 0, default: 3 },
      demandWindowDays: { type: Number, min: 1, default: 30 },
    },
    sourceSnapshotIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessAnalyticsSnapshot',
      },
    ],
    sourceDateRange: {
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ sku: 1, branchCode: 1, status: 1 });
recommendationSchema.index({ recommendationDate: -1, urgency: 1 });

module.exports = mongoose.model('AIReorderRecommendation', recommendationSchema);
