const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware'); // Import the authMiddleware

// Function to generate tokens
function generateToken(userId) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '5m', 
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET); 
  return { accessToken, refreshToken };
}

// User Registration API
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user._id);

    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login API
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user._id);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Token Refresh API
router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      // Generate a new access token
      const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
        expiresIn: '5m', 
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout API
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;