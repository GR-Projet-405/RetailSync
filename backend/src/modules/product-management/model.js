const mongoose = require('mongoose');

/**
 * Sub-schema: Product Variant (e.g. size/colour specific stock)
 * Powers the "Sizes & Stock" block on the Product Details screen.
 */
const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true },          // e.g. "US 9"
    sku: { type: String, trim: true, uppercase: true },
    quantity: { type: Number, default: 0, min: [0, 'Stock quantity cannot be negative'] }, // BR-INV-001
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
  },
  { _id: false }
);

/**
 * Sub-schema: Product Image
 */
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // ---- Basic Information (Add/Edit Product - Step 1) ----
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    brand: { type: String, trim: true, default: '' },

    // SKU is immutable after creation (see Edit Product screen - locked field)
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    barcode: { type: String, trim: true, default: null },

    images: {
      type: [ImageSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A product cannot have more than 10 images'
      }
    },

    // ---- Pricing (Step 2) ----
    pricing: {
      sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: [0, 'Selling price cannot be negative']
      },
      costPrice: { type: Number, min: 0, default: 0 },
      compareAtPrice: { type: Number, min: 0, default: null },
      taxClass: {
        type: String,
        enum: ['STANDARD_15', 'ZERO', 'EXEMPT'],
        default: 'STANDARD_15'
      }
    },

    // ---- Inventory (Step 3) ----
    variants: { type: [VariantSchema], default: [] },
    inventory: {
      trackInventory: { type: Boolean, default: true },
      reorderPoint: { type: Number, default: 0, min: 0 }, // REQ-INV-007
      warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
    },

    // ---- Supplier link (Product Details screen) ----
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    leadTimeDays: { type: String, trim: true, default: '' }, // e.g. "7-10 days"

    // ---- Multi-branch scoping (REQ-BRANCH-003) ----
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // ---- Publish Settings ----
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'INACTIVE'],
      default: 'DRAFT'
    },
    visibility: {
      type: String,
      enum: ['VISIBLE', 'HIDDEN'],
      default: 'VISIBLE'
    },
    featured: { type: Boolean, default: false },

    tags: [{ type: String, trim: true, lowercase: true }],

    // ---- Audit Trail (REQ-PROD-006 / Audit Trail box on Edit screen) ----
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// ---- Virtuals ----
// Total stock across all variants/sizes -> used on Product List "STOCK" column
ProductSchema.virtual('totalStock').get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
});

// Margin % -> used on Edit Product "Current Margin" banner
ProductSchema.virtual('margin').get(function () {
  const { sellingPrice, costPrice } = this.pricing || {};
  if (!sellingPrice || sellingPrice === 0) return 0;
  return Number((((sellingPrice - (costPrice || 0)) / sellingPrice) * 100).toFixed(2));
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// ---- Indexes ----
ProductSchema.index({ name: 'text', brand: 'text', tags: 'text' }); // powers Product Search screen
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ branch: 1 });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);

