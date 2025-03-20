// src/utils/api.js
import axios from 'axios';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  error => {
    // If unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
