// models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [String],
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oneDriveId: String,
  oneDriveUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Full-text search index
NoteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', NoteSchema);

// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  fileType: String,
  fileSize: Number,
  oneDriveId: {
    type: String,
    required: true
  },
  oneDriveUrl: String,
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);

