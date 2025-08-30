const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const User = require('../models/User');

// Get all predictions
router.get('/', async (req, res) => {
  try {
    const predictions = await Prediction.find({ season: '2024-25' })
      .populate('user', 'name team');
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prediction for a specific user
router.get('/user/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const prediction = await Prediction.findOne({ 
      user: user._id, 
      season: '2024-25' 
    });
    res.json(prediction || { message: 'No prediction yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update prediction
router.post('/', async (req, res) => {
  try {
    const { userName, topEight, bottomThree } = req.body;
    
    // Check if past deadline
    const deadline = new Date('2025-12-31T23:00:00');
    if (new Date() > deadline) {
      return res.status(403).json({ error: 'Predictions are locked!' });
    }
    
    const user = await User.findOne({ name: userName });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const prediction = await Prediction.findOneAndUpdate(
      { user: user._id, season: '2024-25' },
      {
        user: user._id,
        topEight,
        bottomThree,
        lastModified: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin override - update anyone's prediction
router.post('/admin-update', async (req, res) => {
  try {
    const { adminName, targetUser, topEight, bottomThree } = req.body;
    
    // Verify admin
    const admin = await User.findOne({ name: adminName });
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const user = await User.findOne({ name: targetUser });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const prediction = await Prediction.findOneAndUpdate(
      { user: user._id, season: '2024-25' },
      {
        user: user._id,
        topEight,
        bottomThree,
        lastModified: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;