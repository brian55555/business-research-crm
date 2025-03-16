// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.microsoftAccessToken;
    }
  },
  microsoftAccessToken: String,
  microsoftRefreshToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hash middleware
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password verification
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

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

// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Completed'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: Date,
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
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

TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);

// models/NewsArticle.js
const mongoose = require('mongoose');

const NewsArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  source: String,
  url: String,
  summary: String,
  publishDate: Date,
  savedDate: {
    type: Date,
    default: Date.now
  },
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
  oneDriveId: String,
  oneDriveUrl: String
});

module.exports = mongoose.model('NewsArticle', NewsArticleSchema);
