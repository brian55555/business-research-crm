// routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Check if authenticated middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password // Will be hashed by pre-save hook
    });

    await newUser.save();

    // Log in the user
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        },
        token
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with email/password
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with Microsoft (OneDrive integration)
router.get('/microsoft', passport.authenticate('azure_ad_oauth2', {
  scope: ['openid', 'profile', 'email', 'offline_access', 'Files.ReadWrite.All']
}));

// Microsoft OAuth callback
router.get('/microsoft/callback', passport.authenticate('azure_ad_oauth2', { 
  failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` 
}), (req, res) => {
  // Generate JWT token
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      hasMicrosoftIntegration: Boolean(req.user.microsoftAccessToken)
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;