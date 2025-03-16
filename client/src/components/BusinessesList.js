// src/components/BusinessesList.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaBuilding, FaFilter, FaTags } from 'react-icons/fa';
import api from '../utils/api';

const BusinessesList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/businesses');
      setBusinesses(response.data);
      
      // Extract all unique tags
      const tags = new Set();
      response.data.forEach(business => {
        business.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load businesses', err);
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    // Filter by search term
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by stage
    const matchesStage = !filterStage || business.stage === filterStage;
    
    // Filter by tag
    const matchesTag = !filterTag || business.tags.includes(filterTag);
    
    return matchesSearch && matchesStage && matchesTag;
  });

  const stages = ['Researching', 'Contacting', 'Meeting', 'Negotiating', 'Closed', 'Not Interested'];

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading businesses...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Businesses</h1>
        <Link to="/businesses/new" className="btn btn-primary">
          <FaPlus className="me-2" /> Add Business
        </Link>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup className="mb-3 mb-md-0">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                >
                  <option value="">All Stages</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaTags />
                </InputGroup.Text>
                <Form.Select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-5">
          <p className="mb-3">No businesses found matching your criteria.</p>
          <Link to="/businesses/new" className="btn btn-outline-primary">
            <FaPlus className="me-2" /> Add your first business
          </Link>
        </div>
      ) : (
        <Row>
          {filteredBusinesses.map((business) => (
            <Col md={6} lg={4} className="mb-4" key={business._id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">
                      <FaBuilding className="me-2 text-secondary" />
                      {business.name}
                    </h5>
                    <Badge bg="info">{business.stage}</Badge>
                  </div>
                  
                  <p className="text-muted mb-2">
                    {business.industry}
                  </p>
                  
                  <p className="mb-3">
                    {business.description?.length > 120
                      ? `${business.description.substring(0, 120)}...`
                      : business.description}
                  </p>
                  
                  <div className="mb-3">
                    {business.tags.map((tag, index) => (
                      <Badge bg="secondary" className="me-1 mb-1" key={index}>{tag}</Badge>
                    ))}
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Link 
                    to={`/businesses/${business._id}`} 
                    className="btn btn-outline-primary btn-sm d-block w-100"
                  >
                    View Details
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BusinessesList;
