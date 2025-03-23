// routes/businesses.js
const express = require('express');
const Business = require('../models/Business');
// const OneDriveService = require('../services/oneDriveService');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Get all businesses for current user
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const businesses = await Business.find({ user: req.user._id });
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single business
router.get('/:id', jwtMiddleware, async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new business
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      user: req.user._id
    };
    
    const business = new Business(businessData);
    await business.save();
    
    // Create folders in OneDrive if user has Microsoft integration
    /*
    if (req.user.microsoftAccessToken) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        await oneDriveService.setupBusinessFolders(business.name, business._id);
      } catch (oneDriveError) {
        console.error('OneDrive folder creation error:', oneDriveError);
        // Continue even if OneDrive setup fails
      }
    }
    */
    res.status(201).json(business);
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ message: 'Server error' });
  }
  
});

// Update a business
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a business
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const business = await Business.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // TODO: Delete related notes, documents, etc.
    // TODO: Consider removing OneDrive folders
    
    res.json({ message: 'Business deleted' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
