//routes/authRoutes
const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/logout', protect, logout);

module.exports = router;
