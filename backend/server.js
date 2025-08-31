const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/prempredictions')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/predictions', require('./routes/predictions'));

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'PremPredictions API is running! Barnbowl Season 20 🏆' });
});

// Get all users
app.get('/api/users', async (req, res) => {
  const User = require('./models/User');
  const users = await User.find({});
  res.json(users);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PremPredictions server running on port ${PORT}`));
// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
