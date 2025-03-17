// src/components/layout/Sidebar.js
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaBuilding, FaTachometerAlt, FaStickyNote, FaFile, FaNewspaper, FaTasks, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </div>
      
      <Nav className="flex-column mt-4">
        <Nav.Link 
          as={Link} 
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
        >
          <FaTachometerAlt className="me-2" />
          <span className="sidebar-link-text">Dashboard</span>
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/businesses"
          className={location.pathname.startsWith('/businesses') ? 'active' : ''}
        >
          <FaBuilding className="me-2" />
          <span className="sidebar-link-text">Businesses</span>
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/contacts"
          className={location.pathname.startsWith('/contacts') ? 'active' : ''}
        >
          <FaUsers className="me-2" />
          <span className="sidebar-link-text">Contacts</span>
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/notes"
          className={location.pathname.startsWith('/notes') ? 'active' : ''}
        >
          <FaStickyNote className="me-2" />
          <span className="sidebar-link-text">Notes</span>
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/documents"
          className={location.pathname.startsWith('/documents') ? 'active' : ''}
        >
          <FaFile className="me-2" />
          <span className="sidebar-link-text">Documents</span>
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/news"
          className={location.pathname.startsWith('/news') ? 'active' : ''}
        >
          <FaNewspaper className="me-2" />
          <span className="sidebar-link-text">News Articles</span>
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/tasks"
          className={location.pathname.startsWith('/tasks') ? 'active' : ''}
        >
          <FaTasks className="me-2" />
          <span className="sidebar-link-text">Tasks</span>
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;