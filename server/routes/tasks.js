// routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const Business = require('../models/Business');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Get all tasks for a user
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      user: req.user._id 
    })
    .populate('business', 'name')
    .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for a business
router.get('/business/:businessId', jwtMiddleware, async (req, res) => {
  try {
    // Verify business belongs to user
    const business = await Business.findOne({ 
      _id: req.params.businessId,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const tasks = await Task.find({ 
      business: req.params.businessId,
      user: req.user._id
    }).sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching business tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single task
router.get('/:id', jwtMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    // If business ID is provided, verify it belongs to user
    if (req.body.business) {
      const business = await Business.findOne({ 
        _id: req.body.business,
        user: req.user._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
    }
    
    const taskData = {
      ...req.body,
      user: req.user._id
    };
    
    const task = new Task(taskData);
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    // If business ID is being updated, verify it belongs to user
    if (req.body.business) {
      const business = await Business.findOne({ 
        _id: req.body.business,
        user: req.user._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
    }
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
