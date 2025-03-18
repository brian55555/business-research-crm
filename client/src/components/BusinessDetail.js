// Updated BusinessDetail.js with Contact List and Notion-like Notes
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Tab, Button, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaDownload, FaNewspaper, FaTasks, FaBuilding, FaUsers } from 'react-icons/fa';
import api from '../utils/api';
import BusinessForm from './BusinessForm';
import NotesManager from './NotesManager';
import DocumentsList from './DocumentsList';
import DocumentUpload from './DocumentUpload';
import NewsArticlesList from './NewsArticlesList';
import NewsArticleForm from './NewsArticleForm';
import TaskForm from './TaskForm';
import ContactsList from './ContactsList';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${id}`);
      setBusiness(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load business', err);
      setError('Failed to load business details');
      setLoading(false);
    }
  };

  const handleBusinessUpdate = (updatedBusiness) => {
    setBusiness(updatedBusiness);
    setEditMode(false);
  };

  const handleDeleteBusiness = async () => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await api.delete(`/businesses/${id}`);
        navigate('/businesses');
      } catch (err) {
        console.error('Failed to delete business', err);
        setError('Failed to delete business');
      }
    }
  };

  const handleDocumentUploaded = () => {
    setShowDocUpload(false);
    // Refresh documents list if needed
  };

  const handleNewsSaved = () => {
    setShowNewsForm(false);
    // Refresh news list if needed
  };

  const handleTaskSaved = () => {
    setShowTaskForm(false);
    setCurrentTaskId(null);
    // Refresh tasks list if needed
  };

  const handleEditTask = (taskId) => {
    setCurrentTaskId(taskId);
    setShowTaskForm(true);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading business details...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {editMode ? (
        <BusinessForm 
          businessData={business} 
          onSave={handleBusinessUpdate} 
          onCancel={() => setEditMode(false)} 
        />
      ) : showDocUpload ? (
        <DocumentUpload 
          businessId={id} 
          onUploaded={handleDocumentUploaded} 
          onCancel={() => setShowDocUpload(false)} 
        />
      ) : showNewsForm ? (
        <NewsArticleForm 
          businessId={id} 
          onSaved={handleNewsSaved} 
          onCancel={() => setShowNewsForm(false)} 
        />
      ) : showTaskForm ? (
        <TaskForm 
          businessId={id} 
          taskId={currentTaskId} 
          onSaved={handleTaskSaved} 
          onCancel={() => {
            setShowTaskForm(false);
            setCurrentTaskId(null);
          }} 
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <FaBuilding className="me-2" />
              {business?.name}
            </h1>
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2" 
                onClick={() => setEditMode(true)}
              >
                <FaEdit className="me-1" /> Edit
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={handleDeleteBusiness}
              >
                <FaTrash className="me-1" /> Delete
              </Button>
            </div>
          </div>

          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Row>
              <Col md={3}>
                <Nav variant="pills" className="flex-column mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="overview">Overview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="contacts">
                      <FaUsers className="me-2" />
                      Contacts
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notes">Notes</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="documents">Documents</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="news">News Articles</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="tasks">Tasks</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col md={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    <Card>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <h5>Business Information</h5>
                            <p><strong>Industry:</strong> {business?.industry}</p>
                            <p><strong>Website:</strong> <a href={business?.website} target="_blank" rel="noopener noreferrer">{business?.website}</a></p>
                            <p><strong>Founded:</strong> {business?.founded ? new Date(business.founded).getFullYear() : 'N/A'}</p>
                            <p><strong>Size:</strong> {business?.size}</p>
                            <p><strong>Headquarters:</strong> {business?.headquarters}</p>
                            <p><strong>Revenue:</strong> {business?.revenue}</p>
                          </Col>
                          <Col md={6}>
                            <h5>Research Status</h5>
                            <p><strong>Stage:</strong> <Badge bg="info">{business?.stage}</Badge></p>
                            <div>
                              <strong>Tags:</strong>
                              <div className="mt-2">
                                {business?.tags.map((tag, index) => (
                                  <Badge bg="secondary" className="me-2 mb-2" key={index}>{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <hr />
                        <h5>Description</h5>
                        <p>{business?.description}</p>
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="contacts">
                    <ContactsList businessId={id} />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="notes">
                    <NotesManager businessId={id} />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="documents">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3>Documents</h3>
                      <Button 
                        variant="primary" 
                        onClick={() => setShowDocUpload(true)}
                      >
                        <FaPlus className="me-2" /> Upload Document
                      </Button>
                    </div>
                    <DocumentsList businessId={id} />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="news">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3>News Articles</h3>
                      <Button 
                        variant="primary" 
                        onClick={() => setShowNewsForm(true)}
                      >
                        <FaNewspaper className="me-2" /> Add News Article
                      </Button>
                    </div>
                    <NewsArticlesList businessId={id} />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="tasks">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3>Tasks</h3>
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          setCurrentTaskId(null);
                          setShowTaskForm(true);
                        }}
                      >
                        <FaTasks className="me-2" /> New Task
                      </Button>
                    </div>
                    {/* <TasksList businessId={id} onEditTask={handleEditTask} /> */}
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </>
      )}
    </Container>
  );
};

export default BusinessDetail;