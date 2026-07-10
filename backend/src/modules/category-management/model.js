const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
      unique: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ''
    },
    // REQ-PROD-002: multi-level category hierarchies
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },

    // ---- Cherry-picked additions from Product Management branch ----
    // Short unique code (auto-generated from name if omitted)
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    // Display / UI helpers
    icon:       { type: String, default: null },
    labelColor: { type: String, default: null },
    sortOrder:  { type: Number, default: 0 },
    // isActive mirrors status — kept in sync via pre-validate hook below
    isActive:   { type: Boolean, default: true },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ---- Hooks (cherry-picked from Product Management branch) ----

// Keep isActive and status in sync
CategorySchema.pre('validate', function (next) {
  if (this.isModified('isActive')) {
    this.status = this.isActive ? 'ACTIVE' : 'INACTIVE';
  } else if (this.isModified('status')) {
    this.isActive = this.status === 'ACTIVE';
  }
  next();
});

// Auto-generate code from name when not provided
CategorySchema.pre('save', async function (next) {
  if (this.isNew && !this.code) {
    const base = this.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 15);

    const count = await mongoose.model('Category').countDocuments({
      code: new RegExp(`^${base}`)
    });
    this.code = count > 0 ? `${base}_${count}` : base;
  }
  next();
});

// Validate parent exists and prevent self-reference
CategorySchema.pre('save', async function (next) {
  if (this.parentCategory) {
    if (this._id && this._id.equals(this.parentCategory)) {
      return next(new Error('Category cannot be its own parent'));
    }
    const parent = await mongoose.model('Category').findById(this.parentCategory);
    if (!parent) {
      return next(new Error('Parent category not found'));
    }
  }
  next();
});

// ---- Indexes ----
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ status: 1 });
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Category', CategorySchema);
