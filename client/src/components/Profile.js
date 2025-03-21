// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaMicrosoft, FaUnlink, FaUserCircle, FaSave, FaKey } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordMode, setPasswordMode] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put('/users/profile', {
        name: formData.name
      });
      
      setSuccess('Profile updated successfully');
      login(localStorage.getItem('token'), response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Password validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      await api.put('/users/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess('Password updated successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMode(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      setLoading(false);
    }
  };

  const handleDisconnectMicrosoft = async () => {
    if (window.confirm('Are you sure you want to disconnect your Microsoft account? This will disable OneDrive integration.')) {
      setError('');
      setSuccess('');
      setLoading(true);
      
      try {
        const response = await api.delete('/users/microsoft-connection');
        setSuccess('Microsoft account disconnected successfully');
        login(localStorage.getItem('token'), response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to disconnect Microsoft account');
        setLoading(false);
      }
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Account Settings</h1>
      
      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Profile Information</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleProfileUpdate}>
                <div className="text-center mb-4">
                  <FaUserCircle size={80} className="text-primary" />
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Email address cannot be changed
                  </Form.Text>
                </Form.Group>
                
                <div className="d-grid">
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          {!passwordMode ? (
            <div className="d-grid">
              <Button 
                variant="outline-secondary" 
                onClick={() => setPasswordMode(true)}
                className="mb-4"
              >
                <FaKey className="me-2" /> Change Password
              </Button>
            </div>
          ) : (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Change Password</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="secondary"
                      onClick={() => setPasswordMode(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <h5>Microsoft Integration</h5>
              <p className="text-muted">
                Connect your Microsoft account to enable OneDrive integration for storing notes, documents, and research materials.
              </p>
              
              {user?.hasMicrosoftIntegration ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <Badge bg="success" className="p-2 me-2">Connected</Badge>
                    <span>Your Microsoft account is connected</span>
                  </div>
                  
                  <Button
                    variant="outline-danger"
                    onClick={handleDisconnectMicrosoft}
                    disabled={loading}
                  >
                    <FaUnlink className="me-2" /> Disconnect Microsoft Account
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <Badge bg="secondary" className="p-2 me-2">Not Connected</Badge>
                    <span>Connect your Microsoft account to enable OneDrive</span>
                  </div>
                  
                  <a
                    href={`${process.env.REACT_APP_API_URL}/auth/microsoft`}
                    className="btn btn-primary"
                  >
                    <FaMicrosoft className="me-2" /> Connect Microsoft Account
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
