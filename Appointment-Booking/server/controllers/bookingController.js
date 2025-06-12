// controllers/bookingController
const Booking = require('../models/Booking');
const User = require('../models/User');
const Availability = require('../models/Availability');

// @desc    Get all bookings (admin view)
// @route   GET /api/bookings
// @access  Admin only
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Admin only
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'name');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update booking status (admin or provider)
// @route   PUT /api/bookings/:id/status
// @access  Admin and Provider
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'declined', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a booking (admin only)
// @route   DELETE /api/bookings/:id
// @access  Admin only
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Release the slot - corrected variable name
    const updateResult = await Availability.updateOne(
      {
        provider: booking.provider,
        'slots.startTime': new Date(booking.startTime),
        'slots.endTime': new Date(booking.endTime)
      },
      { $set: { 'slots.$.isBooked': false } }
    );

    await booking.deleteOne();
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};
