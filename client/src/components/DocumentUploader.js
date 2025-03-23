// DocumentUploader.js - UI component for file uploads to centralized Google Drive
import React, { useState } from 'react';
import storageService from '../services/storageService';

const DocumentUploader = ({ businessId, category, onFileUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // Upload file to central Google Drive account
      setUploadProgress(30);
      const result = await storageService.uploadFile(
        files[0], 
        businessId,
        category
      );
      
      setUploadProgress(70);
      
      if (result.success) {
        // Create a shared link for the file
        const shareResult = await storageService.createSharedLink(result.fileId);
        setUploadProgress(100);
        
        // Notify parent component
        onFileUploaded({
          id: result.fileId,
          name: files[0].name,
          size: files[0].size,
          type: files[0].type,
          path: result.storagePath,
          sharedUrl: shareResult.success ? shareResult.url : null,
          uploadedAt: new Date().toISOString()
        });
        
        // Reset form
        event.target.value = null;
      } else {
        setError(result.error || 'Failed to upload file.');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('An unexpected error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="document-uploader">
      <h3>Upload Document</h3>
      <p className="text-muted">Files will be stored in the company Google Drive account</p>
      
      <div className="form-group">
        <label htmlFor="file-upload" className="btn btn-primary">
          {isUploading ? 'Uploading...' : 'Select File'}
        </label>
        <input
          type="file"
          id="file-upload"
          className="d-none"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="progress mt-2">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${uploadProgress}%` }}
            aria-valuenow={uploadProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
