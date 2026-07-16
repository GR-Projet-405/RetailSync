const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    used: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const warehouseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    manager: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Maintenance",
        "Inactive",
        "Full",
        "Empty",
        "Pending",
        "Approved",
        "Completed",
        "Rejected",
      ],
      default: "Active",
    },

    totalCapacity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    usedCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalLocations: {
      type: Number,
      default: 0,
      min: 0,
    },

    activeSkus: {
      type: Number,
      default: 0,
      min: 0,
    },

    incomingTransfers: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    zoneData: {
      type: [zoneSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
