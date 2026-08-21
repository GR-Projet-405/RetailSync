const mongoose = require("mongoose");

// First Function
const receivedItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId, // was String — fixed
      ref: "Product", // adjust ref name if your Product model is registered under a different name
    },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    orderedQty: { type: Number, required: true, min: 0 },
    receivedQty: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: ["GOOD", "DAMAGED"],
      default: "GOOD",
    },
    // auto-calculated, do not set manually
    difference: { type: Number, default: 0 },
    itemStatus: {
      type: String,
      enum: ["MATCHED", "SHORT", "EXCESS", "DISCREPANCY"],
      default: "MATCHED",
    },
    verifyStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    verifyNote: { type: String, trim: true },
  },
  { _id: true },
);

// Auto-calculate difference & item status (Verification Screen "DIFF" / "STATUS" columns)
receivedItemSchema.pre("validate", function (next) {
  this.difference = this.receivedQty - this.orderedQty;

  if (this.condition === "DAMAGED") {
    this.itemStatus = "DISCREPANCY";
  } else if (this.difference === 0) {
    this.itemStatus = "MATCHED";
  } else if (this.difference < 0) {
    this.itemStatus = "SHORT";
  } else {
    this.itemStatus = "EXCESS";
  }
  next();
});

const GoodsReceivingPageSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, unique: true }, // e.g. GR-2026-0842, auto-generated

    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId, // was String — fixed
      ref: "PurchaseOrder", // adjust ref name to match your PO module
    },
    poNumber: { type: String, required: true }, // e.g. PO-4421, denormalized for fast display

    supplier: {
      type: mongoose.Schema.Types.ObjectId, // was String — fixed (this is the field causing your BSONError)
      ref: "Supplier", // adjust ref name to match your Supplier module
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId, // was String — fixed
      ref: "Branch",
      required: false,
    },

    destinationWarehouse: { type: String, required: true, trim: true },
    deliveryDate: { type: Date, required: true },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId, // was String — fixed
      ref: "User",
      required: true,
    },

    items: {
      type: [receivedItemSchema],
      validate: [
        (arr) => arr.length > 0,
        "At least one received item is required.",
      ],
    },

    notes: { type: String, trim: true },
    verificationNotes: { type: String, trim: true },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_VERIFICATION",
        "DISCREPANCY",
        "VERIFIED",
        "REJECTED",
      ],
      default: "PENDING_VERIFICATION",
    },

    discrepancyCount: { type: Number, default: 0 },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // was String — fixed
    verifiedAt: { type: Date },
    processingTimeMinutes: { type: Number }, // used for "Avg. Processing Time" dashboard stat

    flaggedForManager: { type: Boolean, default: false },
    rejectionReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// Auto-generate receipt number + flag discrepancies before saving
GoodsReceivingPageSchema.pre("save", async function (next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: new Date(`${year}-01-01`) },
    });
    this.receiptNumber = `GR-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  this.discrepancyCount = this.items.filter(
    (i) => i.itemStatus !== "MATCHED",
  ).length;

  // A brand-new receipt with any mismatch automatically needs review (matches
  // the "Discrepancy detected" banner on the Verification Screen)
  if (this.status === "PENDING_VERIFICATION" && this.discrepancyCount > 0) {
    this.status = "DISCREPANCY";
  }

  next();
});

// Note: no separate schema.index({ receiptNumber: 1 }) here — `unique: true`
// above already creates that index. Adding both causes the "Duplicate schema
// index" warning you saw in your server logs.
GoodsReceivingPageSchema.index({ branchId: 1, createdAt: -1 });
GoodsReceivingPageSchema.index({ status: 1 });

module.exports = mongoose.model("GoodsReceivingPage", GoodsReceivingPageSchema);
