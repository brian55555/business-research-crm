// models/Business.js
const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  industry: String,
  website: String,
  description: String,
  size: String,
  founded: Date,
  headquarters: String,
  revenue: String,
  contacts: [{
    name: String,
    position: String,
    email: String,
    phone: String,
    linkedin: String
  }],
  tags: [String],
  stage: {
    type: String,
    enum: ['Researching', 'Contacting', 'Meeting', 'Negotiating', 'Closed', 'Not Interested'],
    default: 'Researching'
  },
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

BusinessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Business', BusinessSchema);