const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'user'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  team: String,
  predictionStyle: String,
  totalPoints: {
    type: Number,
    default: 0
  },
  weeklyPoints: [{
    week: Number,
    points: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
