// src/components/ContactForm.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const ContactForm = ({ businessId, contact, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    company: '',
    email: '',
    phone: '',
    mobile: '',
    linkedIn: '',
    twitter: '',
    notes: '',
    tags: '',
    relationshipStrength: 'New',
    isPrimary: false
  });
  
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  
  useEffect(() => {
    // If editing an existing contact
    if (contact) {
      setFormData({
        ...contact,
        company: contact.company._id || contact.company,
        tags: contact.tags ? contact.tags.join(', ') : ''
      });
    } else if (businessId) {
      // If creating a new contact for a specific business
      setFormData({
        ...formData,
        company: businessId
      });
    }
    
    // Load businesses if not provided a businessId
    if (!businessId) {
      loadBusinesses();
    }
  }, [contact, businessId]);
  
  const loadBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const response = await api.get('/businesses');
      setBusinesses(response.data);
      setLoadingBusinesses(false);
    } catch (err) {
      console.error('Failed to load businesses', err);
      setError('Failed to load businesses');
      setLoadingBusinesses(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.firstName || !formData.lastName) {
      setError('First and last name are required');
      return;
    }
    
    if (!formData.company) {
      setError('Company is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const contactData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      let response;
      if (contact) {
        // Update existing contact
        response = await api.put(`/contacts/${contact._id}`, contactData);
      } else {
        // Create new contact
        response = await api.post('/contacts', contactData);
      }
      
      setLoading(false);
      onSaved(response.data);
    } catch (err) {
      console.error('Failed to save contact', err);
      setError(err.response?.data?.message || 'Failed to save contact');
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Contact Information</h5>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Position</Form.Label>
                <Form.Control
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Company*</Form.Label>
                {businessId ? (
                  <Form.Control
                    type="text"
                    value={businesses.find(b => b._id === businessId)?.name || 'Current Business'}
                    disabled
                  />
                ) : (
                  <Form.Select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    disabled={loadingBusinesses}
                  >
                    <option value="">Select a company</option>
                    {businesses.map(business => (
                      <option key={business._id} value={business._id}>
                        {business.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isPrimary"
                  label="Primary Contact"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <h5 className="mb-3">Contact Details</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Mobile</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>LinkedIn URL</Form.Label>
                <Form.Control
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Twitter URL</Form.Label>
                <Form.Control
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mt-3">
            <Col md={12}>
              <h5 className="mb-3">Additional Information</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Relationship Strength</Form.Label>
                <Form.Select
                  name="relationshipStrength"
                  value={formData.relationshipStrength}
                  onChange={handleChange}
                >
                  <option value="New">New</option>
                  <option value="Connected">Connected</option>
                  <option value="Engaged">Engaged</option>
                  <option value="Strong">Strong</option>
                  <option value="Advocate">Advocate</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tags (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. decision-maker, technical, finance"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="me-2"
              disabled={loading}
            >
              <FaTimes className="me-1" /> Cancel
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
                <>
                  <FaSave className="me-1" /> Save Contact
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ContactForm;