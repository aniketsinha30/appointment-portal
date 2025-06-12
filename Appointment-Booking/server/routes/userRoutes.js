// routes/userRoutes
const express = require('express');
const {
  getDashboard,
  getServices,
  getProviders,
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect, authorize(['user']));

router.get('/dashboard', getDashboard);
router.get('/services', getServices);
router.get('/providers', getProviders);

router.post('/bookings', createBooking);
router.get('/bookings', getBookings);
router.get('/bookings/:id', getBookings);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

module.exports = router;
