// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBuilding, FaCheckCircle, FaExclamationCircle, FaChartBar, FaTasks, FaNewspaper, FaFileAlt } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    businessCount: 0,
    recentBusinesses: [],
    upcomingTasks: [],
    recentNotes: [],
    stageBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load businesses
      const businessesResponse = await api.get('/businesses');
      const businesses = businessesResponse.data;
      
      // Load tasks
      const tasksResponse = await api.get('/tasks');
      const tasks = tasksResponse.data;
      
      // Load recent notes (we'll need to implement this endpoint)
      const notesResponse = await api.get('/notes/recent');
      const notes = notesResponse.data;
      
      // Calculate stage breakdown
      const stages = {};
      businesses.forEach(business => {
        stages[business.stage] = (stages[business.stage] || 0) + 1;
      });
      
      const stageBreakdown = Object.entries(stages).map(([stage, count]) => ({
        stage,
        count,
        percentage: Math.round((count / businesses.length) * 100)
      }));
      
      // Set dashboard data
      setStats({
        businessCount: businesses.length,
        recentBusinesses: businesses.slice(0, 5),
        upcomingTasks: tasks.filter(task => task.status !== 'Completed').slice(0, 5),
        recentNotes: notes.slice(0, 5),
        stageBreakdown
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaBuilding className="display-4 mb-3 text-primary" />
              <h2>{stats.businessCount}</h2>
              <p className="text-muted">Businesses</p>
              <Link to="/businesses" className="btn btn-outline-primary">
                View All
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaTasks className="display-4 mb-3 text-warning" />
              <h2>{stats.upcomingTasks.length}</h2>
              <p className="text-muted">Pending Tasks</p>
              <Link to="/tasks" className="btn btn-outline-warning">
                View All
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaFileAlt className="display-4 mb-3 text-info" />
              <h2>{stats.recentNotes.length}</h2>
              <p className="text-muted">Recent Notes</p>
              <Link to="/notes" className="btn btn-outline-info">
                View All
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Businesses</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {stats.recentBusinesses.length > 0 ? (
                stats.recentBusinesses.map((business) => (
                  <ListGroup.Item key={business._id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <Link to={`/businesses/${business._id}`} className="text-decoration-none">
                        <strong>{business.name}</strong>
                      </Link>
                      <p className="text-muted mb-0 small">{business.industry}</p>
                    </div>
                    <Badge bg="info">{business.stage}</Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  <p className="mb-3">No businesses added yet</p>
                  <Link to="/businesses/new" className="btn btn-outline-primary btn-sm">
                    Add Business
                  </Link>
                </ListGroup.Item>
              )}
            </ListGroup>
            <Card.Footer className="bg-white text-center">
              <Link to="/businesses" className="text-decoration-none">View all businesses</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Upcoming Tasks</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {stats.upcomingTasks.length > 0 ? (
                stats.upcomingTasks.map((task) => (
                  <ListGroup.Item key={task._id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center">
                        {task.priority === 'High' ? (
                          <FaExclamationCircle className="text-danger me-2" />
                        ) : task.status === 'In Progress' ? (
                          <FaCheckCircle className="text-warning me-2" />
                        ) : (
                          <FaCheckCircle className="text-secondary me-2" />
                        )}
                        <span>{task.title}</span>
                      </div>
                      {task.business && (
                        <small className="text-muted">
                          {task.business.name}
                        </small>
                      )}
                    </div>
                    <div>
                      <Badge 
                        bg={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'secondary'}
                        className="me-2"
                      >
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <small className="text-muted">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  <p className="mb-3">No pending tasks</p>
                  <Link to="/tasks/new" className="btn btn-outline-primary btn-sm">
                    Add Task
                  </Link>
                </ListGroup.Item>
              )}
            </ListGroup>
            <Card.Footer className="bg-white text-center">
              <Link to="/tasks" className="text-decoration-none">View all tasks</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Business Stages</h5>
            </Card.Header>
            <Card.Body>
              {stats.stageBreakdown.length > 0 ? (
                stats.stageBreakdown.map((item) => (
                  <div key={item.stage} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{item.stage}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${item.percentage}%` }}
                        aria-valuenow={item.percentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="mb-0">No data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Notes</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {stats.recentNotes.length > 0 ? (
                stats.recentNotes.map((note) => (
                  <ListGroup.Item key={note._id}>
                    <h6 className="mb-1">{note.title}</h6>
                    <p className="mb-1 small">
                      <Link to={`/businesses/${note.business._id}`} className="text-decoration-none">
                        {note.business.name}
                      </Link>
                    </p>
                    <small className="text-muted">
                      {new Date(note.updatedAt).toLocaleString()}
                    </small>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  <p className="mb-3">No notes created yet</p>
                  <Link to="/notes/new" className="btn btn-outline-primary btn-sm">
                    Add Note
                  </Link>
                </ListGroup.Item>
              )}
            </ListGroup>
            <Card.Footer className="bg-white text-center">
              <Link to="/notes" className="text-decoration-none">View all notes</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;