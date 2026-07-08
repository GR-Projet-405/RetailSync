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
    category: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
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
      enum: ['ACTIVE', 'INACTIVE', 'DRAFT', 'DISCONTINUED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Synchronize price/sellingPrice and category/categoryId
productSchema.pre('validate', async function (next) {
  // Sync prices
  if (this.price !== undefined && this.sellingPrice === undefined) {
    this.sellingPrice = this.price;
  }
  if (this.sellingPrice !== undefined && this.price === undefined) {
    this.price = this.sellingPrice;
  }

  // Sync category string and categoryId reference
  if (this.category && !this.categoryId) {
    try {
      const Category = mongoose.model('Category');
      let cat = await Category.findOne({ name: this.category });
      if (!cat) {
        const User = mongoose.model('User');
        let admin = await User.findOne({ username: 'admin' });
        if (!admin) admin = await User.findOne({});
        cat = await Category.create({
          name: this.category,
          createdBy: admin ? admin._id : new mongoose.Types.ObjectId(),
        });
      }
      this.categoryId = cat._id;
    } catch (err) {
      return next(err);
    }
  } else if (this.categoryId && !this.category) {
    try {
      const Category = mongoose.model('Category');
      const cat = await Category.findById(this.categoryId);
      if (cat) {
        this.category = cat.name;
      }
    } catch (err) {
      // Ignore
    }
  }
  next();
});

// Virtual: profit margin percentage
productSchema.virtual('marginPct').get(function () {
  if (!this.costPrice || this.costPrice === 0) return null;
  return (((this.sellingPrice - this.costPrice) / this.costPrice) * 100).toFixed(2);
});

productSchema.index({ sku: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', sku: 'text' }); // full-text search

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
