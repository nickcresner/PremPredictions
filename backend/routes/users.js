const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - list all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:name - get a single user by name
router.get('/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users - create or find user by name
router.post('/', async (req, res) => {
  try {
    const { name, team, email, role } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const normalizedName = name.trim();
    const updates = {
      name: normalizedName,
      team: team || '',
    };
    if (email) updates.email = email;
    if (role) updates.role = role; // optional; default is 'user'

    const user = await User.findOneAndUpdate(
      { name: normalizedName },
      { $setOnInsert: updates },
      { upsert: true, new: true }
    );
    res.status(201).json(user);
  } catch (err) {
    // Handle duplicate key nicely
    if (err.code === 11000) {
      try {
        const existing = await User.findOne({ name: req.body.name });
        return res.status(200).json(existing);
      } catch (_) {}
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

