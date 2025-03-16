// src/components/DocumentsList.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Form, InputGroup, Alert, Dropdown } from 'react-bootstrap';
import { FaDownload, FaTrash, FaSearch, FaSort, FaFilter, FaEllipsisV } from 'react-icons/fa';
import api from '../utils/api';

const DocumentsList = ({ businessId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadDocuments();
  }, [businessId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/business/${businessId}`);
      setDocuments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load documents', err);
      setError('Failed to load documents');
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      // Get document download URL and open in new tab
      window.open(`${process.env.REACT_APP_API_URL}/documents/${documentId}/download`, '_blank');
    } catch (err) {
      console.error('Failed to download document', err);
      setError('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${documentId}`);
        // Remove from list
        setDocuments(documents.filter(doc => doc._id !== documentId));
      } catch (err) {
        console.error('Failed to delete document', err);
        setError('Failed to delete document');
      }
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('msword')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return '📊';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('audio')) return '🔊';
    if (fileType?.includes('video')) return '🎬';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique file types for filter
  const fileTypes = [...new Set(documents.map(doc => {
    // Extract general file type (e.g., "pdf", "image", "word")
    if (doc.fileType?.includes('pdf')) return 'PDF';
    if (doc.fileType?.includes('word') || doc.fileType?.includes('msword')) return 'Word';
    if (doc.fileType?.includes('excel') || doc.fileType?.includes('spreadsheet')) return 'Excel';
    if (doc.fileType?.includes('image')) return 'Image';
    if (doc.fileType?.includes('audio')) return 'Audio';
    if (doc.fileType?.includes('video')) return 'Video';
    return 'Other';
  }))];

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      // Search filter
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // File type filter
      let matchesType = true;
      if (filterType) {
        if (filterType === 'PDF') matchesType = doc.fileType?.includes('pdf');
        else if (filterType === 'Word') matchesType = doc.fileType?.includes('word') || doc.fileType?.includes('msword');
        else if (filterType === 'Excel') matchesType = doc.fileType?.includes('excel') || doc.fileType?.includes('spreadsheet');
        else if (filterType === 'Image') matchesType = doc.fileType?.includes('image');
        else if (filterType === 'Audio') matchesType = doc.fileType?.includes('audio');
        else if (filterType === 'Video') matchesType = doc.fileType?.includes('video');
        else matchesType = true;
      }
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'fileSize') {
        return sortDirection === 'asc'
          ? a.fileSize - b.fileSize
          : b.fileSize - a.fileSize;
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading documents...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3 d-flex flex-wrap">
          <div className="me-auto mb-2">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="ms-md-2 mb-2">
            <InputGroup>
              <InputGroup.Text>
                <FaFilter />
              </InputGroup.Text>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {fileTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </InputGroup>
          </div>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-0">No documents found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleSort('name')}
                    className="d-flex align-items-center"
                  >
                    <span>Name</span>
                    {sortField === 'name' && (
                      <FaSort className="ms-1" />
                    )}
                  </th>
                  <th>Type</th>
                  <th 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleSort('fileSize')}
                    className="d-flex align-items-center"
                  >
                    <span>Size</span>
                    {sortField === 'fileSize' && (
                      <FaSort className="ms-1" />
                    )}
                  </th>
                  <th>Tags</th>
                  <th 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleSort('createdAt')}
                    className="d-flex align-items-center"
                  >
                    <span>Uploaded</span>
                    {sortField === 'createdAt' && (
                      <FaSort className="ms-1" />
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{getFileTypeIcon(document.fileType)}</span>
                        <div>
                          <div>{document.name}</div>
                          {document.description && (
                            <small className="text-muted">{document.description}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">
                        {document.fileType?.split('/').pop().toUpperCase() || 'Unknown'}
                      </Badge>
                    </td>
                    <td>{formatFileSize(document.fileSize)}</td>
                    <td>
                      {document.tags && document.tags.map((tag, index) => (
                        <Badge bg="secondary" key={index} className="me-1 mb-1">{tag}</Badge>
                      ))}
                    </td>
                    <td>
                      {new Date(document.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${document._id}`}>
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleDownload(document._id)}>
                            <FaDownload className="me-2" /> Download
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(document._id)} className="text-danger">
                            <FaTrash className="me-2" /> Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DocumentsList;