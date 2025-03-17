// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../utils/api';

// Create the Authentication Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Effect to set up the auth token in axios and validate the user
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Set the token for API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Validate token and get user info
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          // Handle invalid token
          console.error('Token validation error:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login function
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Check if a user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // The context value that will be supplied to any descendants of this provider
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;