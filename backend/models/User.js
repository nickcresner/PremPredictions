const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Nick', 'Paul', 'James', 'Bigman', 'Dave', 'Alex']
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
  }]
});

module.exports = mongoose.model('User', userSchema);