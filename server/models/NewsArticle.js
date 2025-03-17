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