// src/components/auth/AuthCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  useEffect(() => {
    const processAuthCallback = async () => {
      // Get token from URL parameters
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        setError('Authentication failed. No token received.');
        return;
      }
      
      try {
        // Set token in API headers and validate it
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        
        // Complete the login process
        login(token, response.data.user);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication callback error:', err);
        setError('Failed to authenticate. Please try again.');
      }
    };
    
    processAuthCallback();
  }, [location, login, navigate]);
  
  return (
    <Container className="py-5 text-center">
      {error ? (
        <Alert variant="danger">
          {error}
        </Alert>
      ) : (
        <>
          <Spinner animation="border" />
          <p className="mt-3">Completing authentication, please wait...</p>
        </>
      )}
    </Container>
  );
};

export default AuthCallback;