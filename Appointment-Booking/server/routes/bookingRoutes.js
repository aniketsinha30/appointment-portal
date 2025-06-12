//routes/bookingRoutes
const express = require('express');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Only admin can see all bookings
// router.use(protect, authorize(['admin']));
// currrently need to remove this (user need to delete bookings) 

router.use(protect);

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;
