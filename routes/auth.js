const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ username, email, password });
    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,      // Helps protect against XSS
      secure: false,       // Set to true in production with HTTPS
      sameSite: 'strict',  // Helps mitigate CSRF
      maxAge: 3600000      // 1 hour
    });

    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('token');  // Clear the token cookie
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
