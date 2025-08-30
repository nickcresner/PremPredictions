const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/prempredictions');

const users = [
  { name: 'Nick', isAdmin: true, team: 'Spurs', predictionStyle: 'optimistic-pessimistic' },
  { name: 'Paul', team: 'Spurs', predictionStyle: 'hedging' },
  { name: 'James', team: 'Arsenal', predictionStyle: 'fake-calm' },
  { name: 'Bigman', team: 'Portsmouth', predictionStyle: 'the-rook' },
  { name: 'Dave', team: 'Rugby', predictionStyle: 'finesse' },
  { name: 'Alex', team: 'Lincoln', predictionStyle: 'data-driven' }
];

async function initializeUsers() {
  for (const userData of users) {
    await User.findOneAndUpdate(
      { name: userData.name },
      userData,
      { upsert: true }
    );
  }
  console.log('Barnbowl users initialized!');
  console.log('Nick is admin ✓');
  process.exit();
}

initializeUsers();