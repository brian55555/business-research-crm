// src/components/InteractionForm.js
import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaSave, FaTimes, FaUserCircle } from 'react-icons/fa';
import api from '../utils/api';

const InteractionForm = ({ contact, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'Email',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    outcome: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.type) {
      setError('Interaction type is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post(`/contacts/${contact._id}/interactions`, formData);
      
      setLoading(false);
      onSaved(response.data);
    } catch (err) {
      console.error('Failed to save interaction', err);
      setError(err.response?.data?.message || 'Failed to save interaction');
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">Record Interaction</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-4">
          <div className="d-flex align-items-center">
            <FaUserCircle size={24} className="me-2 text-primary" />
            <h5 className="mb-0">
              {contact.firstName} {contact.lastName}
            </h5>
          </div>
          {contact.position && (
            <p className="text-muted mt-1 mb-0">{contact.position}</p>
          )}
        </div>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Interaction Type*</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Email">Email</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date*</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What was discussed?"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Outcome</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              placeholder="What was the result of this interaction?"
            />
          </Form.Group>
          
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
                  <FaSave className="me-1" /> Save Interaction
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default InteractionForm;