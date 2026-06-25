const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
      index: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    labelColor: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Auto-generate code from name if not provided
categorySchema.pre('save', async function (next) {
  if (this.isNew && !this.code) {
    const base = this.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 15);

    // Ensure uniqueness by appending timestamp suffix if needed
    const count = await mongoose.model('Category').countDocuments({
      code: new RegExp(`^${base}`),
    });
    this.code = count > 0 ? `${base}_${count}` : base;
  }
  next();
});

// Validate parent exists + prevent self-reference
categorySchema.pre('save', async function (next) {
  if (this.parentId) {
    if (this._id && this._id.equals(this.parentId)) {
      return next(new Error('Category cannot be its own parent'));
    }
    const parent = await mongoose.model('Category').findById(this.parentId);
    if (!parent) {
      return next(new Error('Parent category not found'));
    }
  }
  next();
});

// Text search index
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ parentId: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);