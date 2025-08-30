const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  season: {
    type: String,
    required: true,
    default: '2024-25'
  },
  topEight: [{
    position: Number,
    team: String,
    odds: Number
  }],
  bottomThree: [{
    position: Number,
    team: String,
    odds: Number
  }],
  bonusPredictions: {
    goldenBoot: String,
    firstSacked: String,
    bestGoalDifference: String,
    worstGoalDifference: String,
    lowestBigSix: String,
    highestNonBigSix: String
  },
  locked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: Date
});

module.exports = mongoose.model('Prediction', predictionSchema);