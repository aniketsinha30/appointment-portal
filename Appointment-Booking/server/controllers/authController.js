// controllers/authController
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const moment = require('moment-timezone');

// @desc    Register user or provider (provider needs admin approval)
// @route   POST /api/auth/signup
// @access  Public
const register = async (req, res) => {
  const { name, email, password, role, timeZone = 'UTC' } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }
  
  if (!['user', 'provider'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  // Validate timezone if provided
  if (timeZone && !moment.tz.zone(timeZone)) {
    return res.status(400).json({ message: 'Invalid timeZone' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      timeZone,
      isApproved: role === 'provider' ? false : true, // providers need approval
    });

    if (user) {
      generateToken(res, user._id);
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timeZone: user.timeZone,
        isApproved: user.isApproved,
      });
    }
    res.status(400).json({ message: 'Invalid user data' });
  } catch (err) {
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user/provider/admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // if (user.role === 'provider' && !user.isApproved) {
    //   return res.status(403).json({ message: 'Provider registration pending admin approval' });
    // }

    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      timeZone: user.timeZone,
      isApproved: user.isApproved,
      about:user.about,
      experience: user.experience,
      services: user.services

    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout };