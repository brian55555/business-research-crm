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
