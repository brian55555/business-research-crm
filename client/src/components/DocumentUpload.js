// src/components/DocumentUpload.js
import React, { useState } from 'react';
import { Card, Form, Button, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { FaUpload, FaFile, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const DocumentUpload = ({ businessId, onUploaded, onCancel }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      
      // Auto-fill name if not already filled
      if (!formData.name) {
        setFormData({
          ...formData,
          name: e.target.files[0].name.split('.')[0] // Use filename without extension
        });
      }
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    // Check if user has Microsoft integration
    if (!user.hasMicrosoftIntegration) {
      setError('Microsoft integration is required for document upload. Please connect your Microsoft account.');
      return;
    }
    
    setError('');
    setIsUploading(true);
    
    // Create form data for file upload
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('name', formData.name || file.name);
    formDataObj.append('description', formData.description);
    formDataObj.append('business', businessId);
    
    if (formData.tags) {
      formDataObj.append('tags', formData.tags);
    }
    
    try {
      // Use axios to track upload progress
      const response = await api.post('/documents', formDataObj, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setIsUploading(false);
      onUploaded(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">Upload Document</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="mb-4 text-center">
            {!file ? (
              <div className="border rounded p-5 mb-3">
                <input
                  type="file"
                  id="document-upload"
                  onChange={handleFileChange}
                  className="d-none"
                />
                <label htmlFor="document-upload" className="btn btn-outline-primary mb-3">
                  <FaUpload className="me-2" /> Select File
                </label>
                <p className="text-muted mb-0">
                  Click to browse or drop file here
                </p>
              </div>
            ) : (
              <div className="border rounded p-3 mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FaFile className="me-3 text-primary" size={24} />
                    <div>
                      <p className="mb-0 fw-bold">{file.name}</p>
                      <small className="text-muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={removeFile}
                    disabled={isUploading}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Form.Group className="mb-3">
            <Form.Label>Document Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter document name"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter document description"
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. financial, report, analysis"
            />
          </Form.Group>
          
          {isUploading && (
            <div className="mb-4">
              <p className="text-center mb-2">Uploading document...</p>
              <ProgressBar 
                now={uploadProgress} 
                label={`${uploadProgress}%`} 
                animated 
              />
            </div>
          )}
          
          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              onClick={onCancel}
              className="me-2"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="me-2" /> Upload Document
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DocumentUpload;
