//models/Availability
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // UTC date
  slots: [{
    startTime: Date,
    endTime: Date,
    isBooked: { type: Boolean, default: false }
  }],
  timeZone: String // Provider's timezone
}, { timestamps: true });

// Ensure unique availability per provider per day
availabilitySchema.index(
  { provider: 1, date: 1 },
  { unique: true, partialFilterExpression: { date: { $type: 'date' } } }
);

module.exports = mongoose.model('Availability', availabilitySchema);
