const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Report name is required'],
      trim: true,
      maxlength: [200, 'Report name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Report type is required'],
      enum: {
        values: ['SALES', 'INVENTORY', 'FINANCE', 'EMPLOYEE', 'CUSTOMER'],
        message: 'Invalid report type: {VALUE}',
      },
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'generatedBy user is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    filters: {
      dateFrom:    { type: Date },
      dateTo:      { type: Date },
      allBranches: { type: Boolean, default: true },
      branches:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
      additionalFilters: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    metadata: {
      totalRows:       { type: Number, default: 0 },
      executionTimeMs: { type: Number },
      fileSize:        { type: String },
    },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
