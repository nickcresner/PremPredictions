const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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
app.use('/api/users', require('./routes/users'));

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'PremPredictions API is running! Barnbowl Season 20 🏆' });
});

// Legacy inline user route removed in favor of /routes/users

// Serve frontend build (always enabled in deploy)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Send index.html for all non-API routes (SPA fallback)
// Works with Express 5 by using a regex and avoiding API paths
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PremPredictions server running on port ${PORT}`));
