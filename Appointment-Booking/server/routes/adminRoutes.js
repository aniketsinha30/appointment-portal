// routes/adminRoutes
const express = require('express');
const {
  getAllUsers,
  approveProvider,
  declineProvider,
  createService,
  updateService,
  deleteService,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes require Admin role
router.use(protect, authorize(['admin']));

router.get('/users', getAllUsers);

router.put('/providers/:id/approve', approveProvider);
router.delete('/providers/:id/decline', declineProvider);

router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

module.exports = router;
