const mongoose = require('mongoose');

const weeklyChallengeSchema = new mongoose.Schema({
  week: Number,
  type: {
    type: String,
    enum: ['possession', 'teamGoals', 'playerScore', 'exactScore', 'uno']
  },
  question: String,
  options: mongoose.Schema.Types.Mixed,
  submissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answer: mongoose.Schema.Types.Mixed,
    submittedAt: Date
  }],
  result: mongoose.Schema.Types.Mixed,
  pointsAwarded: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WeeklyChallenge', weeklyChallengeSchema);