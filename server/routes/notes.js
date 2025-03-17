// routes/notes.js
const express = require('express');
const Note = require('../models/Note');
const Business = require('../models/Business');
const OneDriveService = require('../services/oneDriveService');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Get all notes for a business
router.get('/business/:businessId', isAuthenticated, async (req, res) => {
  try {
    // Verify business belongs to user
    const business = await Business.findOne({ 
      _id: req.params.businessId,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const notes = await Note.find({ 
      business: req.params.businessId,
      user: req.user._id
    }).sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single note
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Verify business belongs to user
    const business = await Business.findOne({ 
      _id: req.body.business,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const noteData = {
      ...req.body,
      user: req.user._id
    };
    
    const note = new Note(noteData);
    
    // Upload to OneDrive if user has Microsoft integration
    if (req.user.microsoftAccessToken) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        const oneDriveInfo = await oneDriveService.uploadNote(note, business.name);
        
        note.oneDriveId = oneDriveInfo.oneDriveId;
        note.oneDriveUrl = oneDriveInfo.oneDriveUrl;
      } catch (oneDriveError) {
        console.error('OneDrive note upload error:', oneDriveError);
        // Continue even if OneDrive upload fails
      }
    }
    
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    // Find the existing note
    const existingNote = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Update note fields (except user and business)
    existingNote.title = req.body.title;
    existingNote.content = req.body.content;
    existingNote.tags = req.body.tags;
    
    // Update in OneDrive if it exists there
    if (req.user.microsoftAccessToken && existingNote.oneDriveId) {
      try {
        const business = await Business.findById(existingNote.business);
        const oneDriveService = new OneDriveService(req.user);
        
        // Delete old file and create new one
        await oneDriveService.deleteFile(existingNote.oneDriveId);
        const oneDriveInfo = await oneDriveService.uploadNote(existingNote, business.name);
        
        existingNote.oneDriveId = oneDriveInfo.oneDriveId;
        existingNote.oneDriveUrl = oneDriveInfo.oneDriveUrl;
      } catch (oneDriveError) {
        console.error('OneDrive note update error:', oneDriveError);
        // Continue even if OneDrive update fails
      }
    }
    
    await existingNote.save();
    res.json(existingNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Delete from OneDrive if it exists there
    if (req.user.microsoftAccessToken && note.oneDriveId) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        await oneDriveService.deleteFile(note.oneDriveId);
      } catch (oneDriveError) {
        console.error('OneDrive note deletion error:', oneDriveError);
        // Continue even if OneDrive deletion fails
      }
    }
    
    await note.remove();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search notes
router.get('/search/:query', isAuthenticated, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      $text: { $search: req.params.query }
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json(notes);
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;