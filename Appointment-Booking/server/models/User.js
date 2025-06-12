// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');

const userSchema = new mongoose.Schema({
  // Core user fields
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Role management
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
    required: true
  },
  
  // Provider-specific fields
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  about: {
    type: String,
    maxlength: [500, 'About cannot exceed 500 characters'],
    default: ''
  },
  experience: {
    type: String,
    maxlength: [200, 'Experience cannot exceed 200 characters'],
    default: ''
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  
  // Timezone for all users
  timeZone: { 
    type: String, 
    default: 'UTC',
    validate: {
      validator: function(tz) {
        return !!moment.tz.zone(tz);
      },
      message: props => `${props.value} is not a valid timezone!`
    }
  },
  
  // Optional fields for future use
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v); // E.164 format
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  profileImage: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password; // Always remove password from JSON output
      return ret;
    }
  }
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Password verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for formatted creation date
userSchema.virtual('createdAtFormatted').get(function() {
  return moment(this.createdAt).format('MMM Do YYYY');
});

module.exports = mongoose.model('User', userSchema);