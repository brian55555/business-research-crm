// routes/news.js
const express = require('express');
const NewsArticle = require('../models/NewsArticle');
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

// Get all news articles for a business
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
    
    const articles = await NewsArticle.find({ 
      business: req.params.businessId,
      user: req.user._id
    }).sort({ publishDate: -1 });
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single news article
router.get('/:id', jwtMiddleware, async (req, res) => {
  try {
    const article = await NewsArticle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new news article
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    // Verify business belongs to user
    const business = await Business.findOne({ 
      _id: req.body.business,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const articleData = {
      ...req.body,
      user: req.user._id,
      publishDate: req.body.publishDate || new Date()
    };
    
    const article = new NewsArticle(articleData);
    
    // Save to OneDrive if user has Microsoft integration
    /*
    if (req.user.microsoftAccessToken) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        
        // Format article content
        const articleContent = `# ${article.title}\n\nSource: ${article.source}\nURL: ${article.url}\nPublished: ${article.publishDate}\n\n${article.summary}\n\nTags: ${article.tags.join(', ')}`;
        
        // Create file in OneDrive
        const fileResult = await oneDriveService.createTextFile(
          articleContent,
          `News_${article.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`,
          'News Articles',
          business.name
        );
        
        article.oneDriveId = fileResult.id;
        article.oneDriveUrl = fileResult.webUrl;
      } catch (oneDriveError) {
        console.error('OneDrive article save error:', oneDriveError);
        // Continue even if OneDrive save fails
      }
    }
    */
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a news article
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    const article = await NewsArticle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    // Update fields
    if (req.body.title) article.title = req.body.title;
    if (req.body.source) article.source = req.body.source;
    if (req.body.url) article.url = req.body.url;
    if (req.body.summary) article.summary = req.body.summary;
    if (req.body.publishDate) article.publishDate = req.body.publishDate;
    if (req.body.tags) article.tags = req.body.tags;
    
    // Update in OneDrive if it exists there
    if (req.user.microsoftAccessToken && article.oneDriveId) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        const business = await Business.findById(article.business);
        
        // Format article content
        const articleContent = `# ${article.title}\n\nSource: ${article.source}\nURL: ${article.url}\nPublished: ${article.publishDate}\n\n${article.summary}\n\nTags: ${article.tags.join(', ')}`;
        
        // Delete old file and create new one
        await oneDriveService.deleteFile(article.oneDriveId);
        const fileResult = await oneDriveService.createTextFile(
          articleContent,
          `News_${article.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`,
          'News Articles',
          business.name
        );
        
        article.oneDriveId = fileResult.id;
        article.oneDriveUrl = fileResult.webUrl;
      } catch (oneDriveError) {
        console.error('OneDrive article update error:', oneDriveError);
        // Continue even if OneDrive update fails
      }
    }
    
    await article.save();
    res.json(article);
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a news article
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const article = await NewsArticle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    // Delete from OneDrive if it exists there
    if (req.user.microsoftAccessToken && article.oneDriveId) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        await oneDriveService.deleteFile(article.oneDriveId);
      } catch (oneDriveError) {
        console.error('OneDrive article deletion error:', oneDriveError);
        // Continue even if OneDrive deletion fails
      }
    }
    
    await article.remove();
    res.json({ message: 'News article deleted' });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
