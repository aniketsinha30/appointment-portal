//models/Booking
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    startTime: {
      type: Date,
      required: true,
      get: (date) => date.toISOString(), // Always return ISO format
    },
    endTime: {
      type: Date,
      required: true,
      get: (date) => date.toISOString(), // Always return ISO format
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // Apply getters when converting to JSON
  }
);

// Prevent double-booking for same provider+time
bookingSchema.index(
  { provider: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
