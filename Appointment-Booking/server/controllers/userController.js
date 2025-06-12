// controllers/userController
const Service = require('../models/Service');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const { toTimeZone } = require('../utils/bookingUtils');
const moment = require('moment-timezone');


// @desc    Get user dashboard info (current & past bookings)
// @route   GET /api/users/dashboard
// @access  User only
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate('provider', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all services with optional filters and sorting
// @route   GET /api/users/services
// @access  User only
const getServices = async (req, res) => {
  try {
    // Filters: name, provider, availability date, etc.
    const { name, sortBy } = req.query;

    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // case-insensitive search
    }

    let services = await Service.find(query);

    // Sorting (by name, createdAt, etc.)
    if (sortBy) {
      services = services.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
    }

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get providers filtered by service (if provided) with all available slots grouped by date
// @route   GET /api/users/providers?serviceId=9868998798986jc786
// @access  User only
const getProviders = async (req, res) => {
  try {
    const { serviceId } = req.query;
    
    // Build base query
    const query = { 
      role: 'provider', 
      isApproved: true 
    };
    
    // Add service filter if provided
    if (serviceId) {
      query.services = serviceId;
    }

    // Get providers with service details
    const providers = await User.find(query)
      .select('_id name email about experience services timeZone')
      .populate('services', 'name');

    // Get current date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all availability for these providers in the next 30 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const availabilityMap = await Availability.aggregate([
      {
        $match: {
          provider: { $in: providers.map(p => p._id) },
          date: { $gte: today, $lte: endDate }
        }
      },
      {
        $unwind: "$slots"
      },
      {
        $match: {
          "slots.isBooked": false
        }
      },
      {
        $group: {
          _id: {
            provider: "$provider",
            date: "$date"
          },
          slots: {
            $push: {
              startTime: "$slots.startTime",
              endTime: "$slots.endTime"
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.provider",
          availability: {
            $push: {
              date: "$_id.date",
              slots: "$slots"
            }
          }
        }
      }
    ]);

    // Convert to map for quick lookup
    const availabilityByProvider = new Map();
    availabilityMap.forEach(item => {
      availabilityByProvider.set(item._id.toString(), item.availability);
    });

    // Add availability to providers
    const providersWithAvailability = providers.map(provider => {
      const providerId = provider._id.toString();
      const availability = availabilityByProvider.get(providerId) || [];
      
      // Convert to provider's timezone and format dates
      const groupedAvailability = availability.map(day => {
        // Format date in provider's timezone (YYYY-MM-DD)
        const dateStr = moment(day.date).tz(provider.timeZone).format('YYYY-MM-DD');
        
        // Convert slots to provider's timezone
        const convertedSlots = day.slots.map(slot => ({
          startTime: moment(slot.startTime).tz(provider.timeZone).format(),
          endTime: moment(slot.endTime).tz(provider.timeZone).format()
        }));
        
        return {
          date: dateStr,
          slots: convertedSlots
        };
      });
      
      // Sort by date ascending
      groupedAvailability.sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        ...provider.toObject(),
        availability: groupedAvailability
      };
    });

    res.json(providersWithAvailability);
  } catch (err) {
    console.error('Error fetching providers:', err);
    res.status(500).json({ message: 'Server error while fetching providers' });
  }
};

// @desc    Create a new booking
// @route   POST /api/users/bookings
// @access  User only
const createBooking = async (req, res) => {
  const { providerId, serviceId, startTime, endTime } = req.body;
  const userId = req.user._id;

  try {
    // Validate time
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start < now) {
      return res.status(400).json({ message: 'Cannot book past time slots' });
    }

    // Get provider timezone
    const provider = await User.findById(providerId);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    // Convert to UTC using provider's timezone
    const startUTC = moment.tz(startTime, provider.timeZone).utc().toDate();
    const endUTC = moment.tz(endTime, provider.timeZone).utc().toDate();

    // Check user availability
    const userBookings = await Booking.find({
      user: userId,
      startTime: { $lt: endUTC },
      endTime: { $gt: startUTC },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (userBookings.length > 0) {
      return res.status(409).json({ message: 'You already have a booking during this time' });
    }

    // Find and lock availability (atomic update)
    const availability = await Availability.findOneAndUpdate(
      {
        provider: providerId,
        'slots.startTime': startUTC,
        'slots.endTime': endUTC,
        'slots.isBooked': false
      },
      { $set: { 'slots.$.isBooked': true } },
      { new: true }
    );

    if (!availability) {
      return res.status(409).json({ message: 'Time slot no longer available' });
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      provider: providerId,
      service: serviceId,
      startTime: startUTC,
      endTime: endUTC,
      timeZone: req.user.timeZone,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// @desc    Get user bookings (all or by id)
// @route   GET /api/users/bookings/:id?
// @access  User only
const getBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userTimeZone = req.user.timeZone;
    
    const bookings = await Booking.find({ user: userId })
      .populate('provider', 'name email')
      .populate('service', 'name');
    
    // Convert times to user's timezone
    const convertedBookings = bookings.map(booking => ({
      ...booking._doc,
      startTime: toTimeZone(booking.startTime, userTimeZone),
      endTime: toTimeZone(booking.endTime, userTimeZone)
    }));
    
    res.json(convertedBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a booking (only if pending)
// @route   PUT /api/users/bookings/:id
// @access  User only
const updateBooking = async (req, res) => {
  const { startTime, endTime } = req.body; // Changed from date/timeSlot

  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be updated' });
    }

    // Validate new times
    const now = new Date();
    if (new Date(startTime) < now || new Date(endTime) < now) {
      return res.status(400).json({ message: 'Cannot book past time slots' });
    }

    // Release old slot
    await Availability.updateOne(
      {
        provider: booking.provider,
        'slots.startTime': booking.startTime,
        'slots.endTime': booking.endTime
      },
      { $set: { 'slots.$.isBooked': false } }
    );

    // Book new slot
    const availability = await Availability.findOneAndUpdate(
      {
        provider: booking.provider,
        'slots.startTime': new Date(startTime),
        'slots.endTime': new Date(endTime),
        'slots.isBooked': false
      },
      { $set: { 'slots.$.isBooked': true } },
      { new: true }
    );

    if (!availability) {
      return res.status(409).json({ message: 'New time slot no longer available' });
    }

    // Update booking
    booking.startTime = startTime;
    booking.endTime = endTime;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Cancel/delete a booking (only if pending)
// @route   DELETE /api/users/bookings/:id
// @access  User only
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be deleted' });
    }

    // Release the slot
    await Availability.updateOne(
      {
        provider: booking.provider,
        'slots.startTime': booking.startTime,
        'slots.endTime': booking.endTime
      },
      { $set: { 'slots.$.isBooked': false } }
    );

    await booking.deleteOne();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboard,
  getServices,
  getProviders,
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
};
