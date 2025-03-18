// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from './contexts/AuthContext';

// Layout components
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';

// Authentication components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuthCallback from './components/auth/AuthCallback';

// Main components
import Dashboard from './components/Dashboard';
import BusinessesList from './components/BusinessesList';
import BusinessDetail from './components/BusinessDetail';



// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import BusinessForm from './components/BusinessForm';

function App() {
  const { user, loading } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <div className="app-container">
      {user && <Header />}
      
      <div className="main-content">
        {user && <Sidebar />}
        
        <Container fluid className="content-area px-4 py-3">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/businesses" element={<ProtectedRoute><BusinessesList /></ProtectedRoute>} />
            <Route path="/businesses/new" element={<ProtectedRoute><BusinessDetail /></ProtectedRoute>} />
            <Route path="/businesses/:id" element={<ProtectedRoute><BusinessDetail /></ProtectedRoute>} />
            <Route path="/businesses/:id/edit" element={<ProtectedRoute><BusinessForm /></ProtectedRoute>} />
            {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </div>
    </div>
  );
}

export default App;