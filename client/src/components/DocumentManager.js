// DocumentManager.js - Document listing and management component for Google Drive
import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import DocumentUploader from './DocumentUploader';
import DocumentCategorySelector from './DocumentCategorySelector';

const DocumentManager = ({ businessId }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('general');
  const [categories, setCategories] = useState([
    { id: 'general', name: 'General' }
  ]);

  // Load categories when business changes
  useEffect(() => {
    if (!businessId) return;
    
    async function loadCategories() {
      try {
        const result = await storageService.listCategories(businessId);
        
        if (result.success) {
          // Ensure 'general' category always exists
          const hasGeneral = result.categories.some(cat => cat.name.toLowerCase() === 'general');
          
          const allCategories = hasGeneral 
            ? result.categories 
            : [{ id: 'general', name: 'General' }, ...result.categories];
          
          setCategories(allCategories);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    
    loadCategories();
  }, [businessId]);

  // Load documents when component mounts or businessId/category changes
  useEffect(() => {
    loadDocuments();
  }, [businessId, currentCategory]);

  const loadDocuments = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // List files in the business category folder
      const result = await storageService.listFiles(businessId, currentCategory);
      
      if (result.success) {
        setDocuments(result.files);
      } else {
        setError(result.error || 'Failed to load documents.');
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('An unexpected error occurred while loading documents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploaded = (newDocument) => {
    setDocuments(prevDocs => [...prevDocs, newDocument]);
  };

  const handleDeleteDocument = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const result = await storageService.deleteFile(fileId);
      
      if (result.success) {
        // Remove from UI
        setDocuments(prevDocs => 
          prevDocs.filter(doc => doc.id !== fileId)
        );
      } else {
        setError(result.error || 'Failed to delete the document.');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('An unexpected error occurred while deleting the document.');
    }
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
  };

  const handleAddCategory = async (newCategory) => {
    if (!businessId || !newCategory) return;
    
    try {
      // Create folder path
      await storageService.getOrCreateFolder(newCategory, await storageService.getOrCreateFolder(`business_${businessId}`));
      
      // Refresh categories
      const result = await storageService.listCategories(businessId);
      
      if (result.success) {
        setCategories(result.categories);
        setCurrentCategory(newCategory);
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add new category.');
    }
  };

  if (!businessId) {
    return (
      <div className="alert alert-warning">
        Please select a business to manage documents.
      </div>
    );
  }

  return (
    <div className="document-manager">
      <h2>Business Documents</h2>
      
      <div className="storage-info-banner alert alert-info mb-4">
        <i className="fas fa-info-circle mr-2"></i>
        All documents are stored in our company's Google Drive account and organized by business and category.
      </div>
      
      <DocumentCategorySelector 
        categories={categories}
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        onAddCategory={handleAddCategory}
      />
      
      <DocumentUploader 
        businessId={businessId}
        category={currentCategory}
        onFileUploaded={handleFileUploaded}
      />
      
      {isLoading ? (
        <div className="text-center mt-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="alert alert-info mt-3">
          No documents have been uploaded to this category yet.
        </div>
      ) : (
        <div className="mt-4">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{doc.mimeType ? doc.mimeType.split('/')[1] : 'Unknown'}</td>
                  <td>{Math.round(doc.size / 1024)} KB</td>
                  <td>{new Date(doc.modifiedAt).toLocaleString()}</td>
                  <td>
                    <div className="btn-group">
                      <a 
                        href={doc.viewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </a>
                      <a 
                        href={doc.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                      >
                        Download
                      </a>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
