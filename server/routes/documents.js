// routes/documents.js
const express = require('express');
const multer = require('multer');
const Document = require('../models/Document');
const Business = require('../models/Business');
// const OneDriveService = require('../services/oneDriveService');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Get all documents for a business
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
    
    const documents = await Document.find({ 
      business: req.params.businessId,
      user: req.user._id
    }).sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single document
router.get('/:id', jwtMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a new document
router.post('/', jwtMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Verify business belongs to user
    const business = await Business.findOne({ 
      _id: req.body.business,
      user: req.user._id
    });
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Upload to OneDrive
    if (!req.user.microsoftAccessToken) {
      return res.status(400).json({ message: 'Microsoft integration required for document upload' });
    }
    
    try {
      const oneDriveService = new OneDriveService(req.user);
      const filename = req.file.originalname;
      const fileBuffer = req.file.buffer;
      
      const oneDriveInfo = await oneDriveService.uploadFile(
        fileBuffer, 
        filename, 
        business.name, 
        'Documents'
      );
      
      // Create document record
      const document = new Document({
        name: req.body.name || filename,
        description: req.body.description || '',
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        tags: req.body.tags ? req.body.tags.split(',') : [],
        oneDriveId: oneDriveInfo.oneDriveId,
        oneDriveUrl: oneDriveInfo.oneDriveUrl,
        business: business._id,
        user: req.user._id
      });
      
      await document.save();
      res.status(201).json(document);
    } catch (oneDriveError) {
      console.error('OneDrive document upload error:', oneDriveError);
      return res.status(500).json({ message: 'Failed to upload document to OneDrive' });
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document metadata
router.put('/:id', jwtMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update document fields
    if (req.body.name) document.name = req.body.name;
    if (req.body.description) document.description = req.body.description;
    if (req.body.tags) document.tags = req.body.tags;
    
    await document.save();
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a document
router.delete('/:id', jwtMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete from OneDrive
    if (req.user.microsoftAccessToken && document.oneDriveId) {
      try {
        const oneDriveService = new OneDriveService(req.user);
        await oneDriveService.deleteFile(document.oneDriveId);
      } catch (oneDriveError) {
        console.error('OneDrive document deletion error:', oneDriveError);
        // Continue even if OneDrive deletion fails
      }
    }
    
    await document.remove();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document
router.get('/:id/download', jwtMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Download from OneDrive
    if (!req.user.microsoftAccessToken) {
      return res.status(400).json({ message: 'Microsoft integration required for document download' });
    }
    
    try {
      const oneDriveService = new OneDriveService(req.user);
      const fileContent = await oneDriveService.getFileContent(document.oneDriveId);
      
      // Set appropriate headers
      res.set('Content-Type', document.fileType);
      res.set('Content-Disposition', `attachment; filename="${document.name}"`);
      
      // Send file
      res.send(fileContent);
    } catch (oneDriveError) {
      console.error('OneDrive document download error:', oneDriveError);
      return res.status(500).json({ message: 'Failed to download document from OneDrive' });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;