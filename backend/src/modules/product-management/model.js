const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },
    unit: {
      type: String,
      enum: ['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'pack', 'dozen', 'metre'],
      default: 'pcs',
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual: profit margin percentage
productSchema.virtual('marginPct').get(function () {
  if (!this.costPrice || this.costPrice === 0) return null;
  return (((this.sellingPrice - this.costPrice) / this.costPrice) * 100).toFixed(2);
});

productSchema.index({ categoryId: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', sku: 'text' }); // full-text search

module.exports = mongoose.model('Product', productSchema);
