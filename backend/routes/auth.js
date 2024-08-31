const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body); // Log the request body
  try {
    const { username, password } = req.body;
    
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.status(201).json({ user: { id: user._id, username: user.username }, token });
  } catch (error) {
    console.error('Registration error:', error); // Log the error
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        // ... other user data you want to include
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).send(error);
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
