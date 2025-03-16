// models/Contact.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  position: String,
  department: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: String,
  mobile: String,
  linkedIn: String,
  twitter: String,
  notes: String,
  tags: [String],
  lastContacted: Date,
  relationshipStrength: {
    type: String,
    enum: ['New', 'Connected', 'Engaged', 'Strong', 'Advocate'],
    default: 'New'
  },
  interactions: [{
    type: {
      type: String,
      enum: ['Email', 'Call', 'Meeting', 'Social', 'Other'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    outcome: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Full-text search index
ContactSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  position: 'text', 
  department: 'text',
  email: 'text',
  notes: 'text'
});

module.exports = mongoose.model('Contact', ContactSchema);

// routes/contacts.js
const express = require('express');
const Contact = require('../models/Contact');
const Business = require('../models/Business');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Get all contacts for a business
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
    
    const contacts = await Contact.find({ 
      company: req.params.businessId,
      user: req.user._id
    }).sort({ lastName: 1, firstName: 1 });
    
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contacts for current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const contacts = await Contact.find({ 
      user: req.user._id 
    })
    .populate('company', 'name')
    .sort({ lastName: 1, firstName: 1 });
    
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single contact
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('company', 'name');
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new contact
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Verify business belongs to user
    const business = await Business.findOne({ 
      _id: req.body.company,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // If setting as primary, unset other primary contacts
    if (req.body.isPrimary) {
      await Contact.updateMany(
        { company: req.body.company, isPrimary: true },
        { $set: { isPrimary: false } }
      );
    }
    
    const contactData = {
      ...req.body,
      user: req.user._id
    };
    
    const contact = new Contact(contactData);
    await contact.save();
    
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a contact
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // If updating company, verify it belongs to user
    if (req.body.company && req.body.company !== contact.company.toString()) {
      const business = await Business.findOne({ 
        _id: req.body.company,
        user: req.user._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
    }
    
    // If setting as primary, unset other primary contacts
    if (req.body.isPrimary && !contact.isPrimary) {
      await Contact.updateMany(
        { company: contact.company, isPrimary: true },
        { $set: { isPrimary: false } }
      );
    }
    
    // Update contact fields
    Object.keys(req.body).forEach(key => {
      // Don't update user or _id
      if (key !== 'user' && key !== '_id') {
        contact[key] = req.body[key];
      }
    });
    
    await contact.save();
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an interaction to a contact
router.post('/:id/interactions', isAuthenticated, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    const { type, notes, outcome, date } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Interaction type is required' });
    }
    
    const interaction = {
      type,
      notes,
      outcome,
      date: date || new Date()
    };
    
    // Add interaction and update lastContacted
    contact.interactions.push(interaction);
    contact.lastContacted = interaction.date;
    
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an interaction
router.delete('/:id/interactions/:interactionId', isAuthenticated, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Find and remove the interaction
    const interactionIndex = contact.interactions.findIndex(
      interaction => interaction._id.toString() === req.params.interactionId
    );
    
    if (interactionIndex === -1) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    
    contact.interactions.splice(interactionIndex, 1);
    
    // Update lastContacted to the most recent interaction
    if (contact.interactions.length > 0) {
      const sortedInteractions = [...contact.interactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      contact.lastContacted = sortedInteractions[0].date;
    } else {
      contact.lastContacted = undefined;
    }
    
    await contact.save();
    res.json(contact);
  } catch (error) {
    console.error('Error deleting interaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a contact
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search contacts
router.get('/search/:query', isAuthenticated, async (req, res) => {
  try {
    const contacts = await Contact.find({
      user: req.user._id,
      $text: { $search: req.params.query }
    })
    .populate('company', 'name')
    .sort({ score: { $meta: 'textScore' } });
    
    res.json(contacts);
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
