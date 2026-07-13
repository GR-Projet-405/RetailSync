const mongoose = require('mongoose');

// ─── Chart data point (one per day in the forecast horizon) ───
const chartPointSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },        // e.g. "Jul 01"
    actual: { type: Number, default: null },        // null for future dates
    predicted: { type: Number, required: true },
    lowerBound: { type: Number, required: true },
    upperBound: { type: Number, required: true },
  },
  { _id: false }
);

// ─── Product-level demand forecast ───
const productForecastSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    currentStock: { type: Number, default: 0 },
    predictedDemand: { type: Number, default: 0 },
    recommendedReorder: { type: Number, default: 0 },
    risk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  },
  { _id: false }
);

// ─── AI Insight (weather/event type entries) ───
const insightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, required: true },
    icon: { type: String, default: 'Sun' },       // icon name for frontend
    iconColor: { type: String, default: 'text-amber-500' },
    bg: { type: String, default: 'bg-amber-50' },
  },
  { _id: false }
);

// ─── Summary KPIs ───
const summaryMetricsSchema = new mongoose.Schema(
  {
    predictedValue: { type: String, required: true },     // formatted like "$33,400.00"
    predictedChange: { type: String, default: '+0.0%' },
    predictedTrend: { type: String, enum: ['up', 'down'], default: 'up' },
    highDemandCount: { type: String, default: '0 Items' },
    highDemandChange: { type: String, default: 'Stable' },
    stockRiskLevel: { type: String, default: 'Low Risk' },
    stockRiskVariant: { type: String, enum: ['success', 'warning', 'danger'], default: 'success' },
  },
  { _id: false }
);

// ─── Main Forecast Result ───
const forecastResultSchema = new mongoose.Schema(
  {
    metric: {
      type: String,
      enum: ['revenue', 'transactions'],
      required: true,
    },
    period: {
      type: String,
      enum: ['7d', '14d', '30d'],
      required: true,
    },
    chartData: {
      type: [chartPointSchema],
      default: [],
    },
    summaryMetrics: {
      type: summaryMetricsSchema,
      required: true,
    },
    productForecasts: {
      type: [productForecastSchema],
      default: [],
    },
    insights: {
      type: [insightSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one cached result per metric+period
forecastResultSchema.index({ metric: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('ForecastResult', forecastResultSchema);
