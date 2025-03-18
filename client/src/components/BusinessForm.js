// src/components/BusinessForm.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const BusinessForm = ({ businessData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    size: '',
    founded: '',
    headquarters: '',
    revenue: '',
    tags: '',
    stage: 'Researching'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // If editing existing business, populate the form
  useEffect(() => {
    if (businessData) {
      setFormData({
        ...businessData,
        founded: businessData.founded ? new Date(businessData.founded).toISOString().split('T')[0] : '',
        tags: businessData.tags ? businessData.tags.join(', ') : ''
      });
    }
  }, [businessData]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Prepare the data for API
      const businessFormData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      let response;
      
      if (businessData) {
        // Update existing business
        response = await api.put(`/businesses/${businessData._id}`, businessFormData);
      } else {
        // Create new business
        response = await api.post('/businesses', businessFormData);
      }
      
      setLoading(false);
      
      // If onSave callback is provided, use it, otherwise navigate
      if (onSave) {
        onSave(response.data);
      } else {
        navigate(`/businesses/${response.data._id}`);
      }
    } catch (err) {
      console.error('Business save error:', err);
      setError(err.response?.data?.message || 'Failed to save business data');
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">{businessData ? 'Edit Business' : 'Add New Business'}</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Business Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Industry</Form.Label>
                <Form.Control
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001+">1001+ employees</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Founded</Form.Label>
                <Form.Control
                  type="date"
                  name="founded"
                  value={formData.founded}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Headquarters</Form.Label>
                <Form.Control
                  type="text"
                  name="headquarters"
                  value={formData.headquarters}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Revenue</Form.Label>
                <Form.Control
                  type="text"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  placeholder="e.g. $1M-$5M"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Research Stage</Form.Label>
                <Form.Select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                >
                  <option value="Researching">Researching</option>
                  <option value="Contacting">Contacting</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Closed">Closed</option>
                  <option value="Not Interested">Not Interested</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. tech, startup, saas"
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={onCancel || (() => navigate(-1))}
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                'Save Business'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BusinessForm;