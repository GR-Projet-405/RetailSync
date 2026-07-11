const mongoose = require('mongoose');

const alertMetadataSchema = new mongoose.Schema({}, { _id: false, strict: false });

const aiAlertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['low_stock', 'sales_target', 'anomaly'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    impact: {
      type: String,
      trim: true,
      default: '',
    },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      required: true,
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: 'AI Engine',
    },
    date: {
      type: String,
      default: '',
    },
    timeGroup: {
      type: String,
      enum: ['Today', 'Yesterday', 'This Week', 'Older'],
      default: 'Today',
    },
    metadata: {
      type: alertMetadataSchema,
      default: {},
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

aiAlertSchema.index({ acknowledged: 1, createdAt: -1 });
aiAlertSchema.index({ category: 1, severity: 1 });

module.exports = mongoose.model('AIAlert', aiAlertSchema);
