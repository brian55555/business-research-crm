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