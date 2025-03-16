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
