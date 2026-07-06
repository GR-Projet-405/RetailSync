const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      required: [true, 'Branch code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    address: {
      line1: {
        type: String,
        required: [true, 'Address line 1 is required'],
      },
      line2: {
        type: String,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      district: {
        type: String,
        required: [true, 'District/Province is required'],
      },
      postalCode: {
        type: String,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    openingDate: {
      type: Date,
      required: [true, 'Opening date is required'],
    },
    managerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    deactivatedAt: {
      type: Date,
    },
    deactivatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted address
branchSchema.virtual('formattedAddress').get(function () {
  let address = this.address.line1;
  if (this.address.line2) address += `, ${this.address.line2}`;
  if (this.address.city) address += `, ${this.address.city}`;
  if (this.address.district) address += `, ${this.address.district}`;
  if (this.address.postalCode) address += ` - ${this.address.postalCode}`;
  return address;
});

// Ensure virtuals are included in JSON
branchSchema.set('toJSON', { virtuals: true });
branchSchema.set('toObject', { virtuals: true });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
