// src/components/TaskForm.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const TaskForm = ({ businessId, taskId, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    business: businessId || ''
  });
  
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTask, setLoadingTask] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  
  // Load task data if editing or businesses list if creating
  useEffect(() => {
    if (!businessId) {
      loadBusinesses();
    }
    
    if (taskId) {
      loadTask();
    }
  }, [businessId, taskId]);
  
  // Function to load task data when editing
  const loadTask = async () => {
    try {
      setLoadingTask(true);
      const response = await api.get(`/tasks/${taskId}`);
      setFormData({
        ...response.data,
        business: response.data.business._id || response.data.business,
        dueDate: response.data.dueDate ? new Date(response.data.dueDate).toISOString().split('T')[0] : ''
      });
      setLoadingTask(false);
    } catch (err) {
      console.error('Failed to load task', err);
      setError('Failed to load task');
      setLoadingTask(false);
    }
  };
  
  // Function to load businesses for dropdown selection
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
  
  // Handle form field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      if (taskId) {
        // Update existing task
        response = await api.put(`/tasks/${taskId}`, formData);
      } else {
        // Create new task
        response = await api.post('/tasks', formData);
      }
      
      setLoading(false);
      onSaved(response.data);
    } catch (err) {
      console.error('Failed to save task', err);
      setError(err.response?.data?.message || 'Failed to save task');
      setLoading(false);
    }
  };
  
  // Show loading spinner when fetching task data
  if (loadingTask) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading task...</p>
      </div>
    );
  }
  
  // The form UI
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">{taskId ? 'Edit Task' : 'Add New Task'}</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title*</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              {!businessId && (
                <Form.Group className="mb-3">
                  <Form.Label>Business</Form.Label>
                  <Form.Select
                    name="business"
                    value={formData.business}
                    onChange={handleChange}
                    disabled={loadingBusinesses}
                  >
                    <option value="">None (Personal Task)</option>
                    {businesses.map(business => (
                      <option key={business._id} value={business._id}>
                        {business.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
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
                  <FaSave className="me-1" /> Save Task
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TaskForm;