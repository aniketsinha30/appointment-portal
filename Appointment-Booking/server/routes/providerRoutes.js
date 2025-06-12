// routes/providerRoutes
const express = require('express');
const {
  getDashboard,
  addOrUpdateAvailability,
  deleteAvailability,
  updateBookingStatus,
  updateProfile,
  getAvailability
} = require('../controllers/providerController');
const {getServices} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect)
router.get('/availability', getAvailability); // Excluded with authorization
router.get('/dashboard', getDashboard); // unauthorized can see the data

router.use(authorize(['provider']));
router.get('/services', getServices);
// router.get("/availability",getAvailability)
router.post('/availability', addOrUpdateAvailability);
router.delete('/availability/:date', deleteAvailability);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/profile', updateProfile);

module.exports = router;
