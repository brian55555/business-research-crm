// src/components/layout/Header.js
import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaBuilding, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="header">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">Business Research CRM</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FaTachometerAlt className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/businesses">
              <FaBuilding className="me-1" /> Businesses
            </Nav.Link>
          </Nav>
          {user && (
            <Nav>
              <NavDropdown title={
                <span>
                  <FaUser className="me-1" /> {user.name}
                </span>
              } id="user-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">
                  <FaCog className="me-2" /> Profile Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;