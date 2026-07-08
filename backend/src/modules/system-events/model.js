const mongoose = require('mongoose');

const SystemEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    timestamp: { type: Date, required: true },
    severity: {
      type: String,
      enum: ['CRITICAL', 'ERROR', 'WARNING', 'INFO'],
      required: true,
    },
    eventType: { type: String, required: true },
    source: { type: String, required: true },
    message: { type: String, required: true },
    subtitle: { type: String, default: null },
    action: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemEvent', SystemEventSchema);
