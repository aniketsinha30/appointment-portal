// controllers/providerController
const User = require('../models/User');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const { generateSlots } = require('../utils/bookingUtils');
const moment = require('moment-timezone');


// @desc    Get provider dashboard info (bookings & availability summary)
// @route   GET /api/providers/dashboard
// @access  Provider only
const getDashboard = async (req, res) => {
  try {
    const providerId = req.user._id;
    const providerTimeZone = req.user.timeZone;

    // Get upcoming bookings
    const bookings = await Booking.find({ 
      provider: providerId,
      startTime: { $gte: new Date() }
    })
    .populate('user', 'name email')
    .populate('service', 'name')
    .sort({ startTime: 1 })
    .lean();

    // Convert booking times to provider's timezone
    const convertedBookings = bookings.map(booking => ({
      ...booking,
      startTime: moment(booking.startTime).tz(providerTimeZone).format(),
      endTime: moment(booking.endTime).tz(providerTimeZone).format()
    }));

    // Get next 7 days availability
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const availability = await Availability.find({
      provider: providerId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).lean();

    res.json({ 
      bookings: convertedBookings, 
      availability 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add or update availability for a date
// @route   POST /api/providers/availability
// @access  Provider only
const addOrUpdateAvailability = async (req, res) => {
  const { date, startTime, endTime, duration = 30 } = req.body;
  const providerId = req.user._id;
  const providerTimeZone = req.user.timeZone;

  try {
    // Validate input times
    const now = new Date();
    const selectedDate = new Date(date);
    
    if (selectedDate < now.setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'Cannot set availability for past dates' });
    }   
    
    // Corrected UTC conversion
    const utcDate = moment.utc(date).startOf('day').toDate();

     // Combine date + time in provider's timezone
  const startDateTime = moment.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', providerTimeZone);
  const endDateTime = moment.tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', providerTimeZone);

    // Generate slots using provider's timezone
    const slots = generateSlots(
    startDateTime.toDate(),
    endDateTime.toDate(),
    duration,
    providerTimeZone
  );

    const availability = await Availability.findOneAndUpdate(
      { provider: providerId, date: utcDate },
      { 
        slots,
        timeZone: providerTimeZone,
        lockedAt: null
      },
      { upsert: true, new: true }
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get availability for a specific provider
// @route   GET /api/providers/availability?providerId=<id>&date=2025-06-15&timeZone=America/New_York
// @access  Public
const getAvailability = async (req, res) => {
  const { providerId, date, timeZone = 'UTC' } = req.query;

  try {
    // Validate timeZone
    if (!moment.tz.zone(timeZone)) {
      return res.status(400).json({ message: 'Invalid timeZone' });
    }
    const utcDate = moment.tz(date, timeZone).startOf('day').utc().toDate();
    const availability = await Availability.findOne({
      provider: providerId,
      date: utcDate
    });

    if (!availability) return res.json({ slots: [] });

    // Convert to requested timezone
    const convertedSlots = availability.slots.map(slot => ({
      ...slot.toObject(),
      startTime: moment(slot.startTime).tz(timeZone).format(),
      endTime: moment(slot.endTime).tz(timeZone).format()
    }));

    res.json({ 
      ...availability.toObject(), 
      slots: convertedSlots 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Delete availability for a specific date
// @route   DELETE /api/providers/availability/:date
// @access  Provider only
const deleteAvailability = async (req, res) => {
  try {
    const providerId = req.user._id;
    const date = new Date(req.params.date);

    const availability = await Availability.findOneAndDelete({ provider: providerId, date });

    if (!availability) {
      return res.status(404).json({ message: 'Availability not found for this date' });
    }

    res.json({ message: 'Availability deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update booking status (confirm/decline)
// @route   PUT /api/providers/bookings/:id/status
// @access  Provider only
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const providerId = req.user._id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.provider.equals(providerId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }
    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update booking
    booking.status = status;
    await booking.save();

    // Release slot if declined
    if (status === 'declined') {
      await Availability.updateOne(
        {
          provider: providerId,
          'slots.startTime': booking.startTime,
          'slots.endTime': booking.endTime
        },
        { $set: { 'slots.$.isBooked': false } }
      );
    }

    res.json({ message: `Booking ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Provider only
const updateProfile = async (req, res) => {
  // const { name, email, about, experience, services, timeZone } = req.body;
  const { name, about, experience, services, timeZone } = req.body;

  try {
    const provider = await User.findById(req.user._id);

    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    // Validate timeZone
    if (timeZone && !moment.tz.zone(timeZone)) {
      return res.status(400).json({ message: 'Invalid timeZone' });
    }

    // Update fields
    if (name) provider.name = name;
    // if (email) provider.email = email;
    if (about) provider.about = about;
    if (experience) provider.experience = experience;
    if (services) provider.services = services;
    if (timeZone) provider.timeZone = timeZone;

    await provider.save();

    res.json({
      _id: provider._id,
      name: provider.name,
      // email: provider.email,
      about: provider.about,
      experience: provider.experience,
      services: provider.services,
      timeZone: provider.timeZone
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





module.exports = {
  getDashboard,
  addOrUpdateAvailability,
  deleteAvailability,
  updateBookingStatus,
  updateProfile,
  getAvailability
};
