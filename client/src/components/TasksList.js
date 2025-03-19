// src/components/TasksList.js
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Spinner, Form, InputGroup, Alert, Dropdown } from 'react-bootstrap';
import { FaSearch, FaFilter, FaEdit, FaTrash, FaCheck, FaArrowRight, FaEllipsisV } from 'react-icons/fa';
import api from '../utils/api';
import { format, isPast, isToday } from 'date-fns';

const TasksList = ({ businessId, onEditTask }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  useEffect(() => {
    loadTasks();
  }, [businessId]);
  
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(businessId ? `/tasks/business/${businessId}` : '/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setError('Failed to load tasks');
      setLoading(false);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        loadTasks();
      } catch (err) {
        console.error('Failed to delete task', err);
        setError('Failed to delete task');
      }
    }
  };
  
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
      setError('Failed to update task status');
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Todo': return 'secondary';
      case 'In Progress': return 'primary';
      case 'Completed': return 'success';
      default: return 'secondary';
    }
  };
  
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'secondary';
    }
  };
  
  const getDueDateClass = (dueDate) => {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return 'text-danger';
    }
    if (isToday(date)) {
      return 'text-warning';
    }
    return '';
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    // Priority filter
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading tasks...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3 d-flex flex-wrap">
          <div className="me-auto mb-2">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="d-flex mb-2">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="me-2"
              style={{ width: '130px' }}
            >
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Form.Select>
            <Form.Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '130px' }}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Form.Select>
          </div>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-0">No tasks found.</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {filteredTasks.map((task) => (
              <ListGroup.Item key={task._id} className="py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="me-auto">
                    <div className="d-flex align-items-center mb-1">
                      <h5 className="mb-0">{task.title}</h5>
                      <Badge bg={getStatusVariant(task.status)} className="ms-2">
                        {task.status}
                      </Badge>
                      <Badge bg={getPriorityVariant(task.priority)} className="ms-2">
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="mb-2">{task.description}</p>
                    )}
                    
                    {!businessId && task.business && (
                      <p className="text-muted mb-1">
                        <strong>Business:</strong> {task.business.name}
                      </p>
                    )}
                    
                    {task.dueDate && (
                      <p className={`mb-0 ${getDueDateClass(task.dueDate)}`}>
                        <strong>Due:</strong> {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                  
                  <div className="d-flex">
                    {task.status !== 'Completed' && (
                      <Dropdown className="me-1">
                        <Dropdown.Toggle variant="outline-success" size="sm" id={`status-dropdown-${task._id}`}>
                          <FaArrowRight className="me-1" /> Move
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {task.status !== 'Todo' && (
                            <Dropdown.Item onClick={() => handleStatusChange(task._id, 'Todo')}>
                              To Do
                            </Dropdown.Item>
                          )}
                          {task.status !== 'In Progress' && (
                            <Dropdown.Item onClick={() => handleStatusChange(task._id, 'In Progress')}>
                              In Progress
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item onClick={() => handleStatusChange(task._id, 'Completed')}>
                            <FaCheck className="me-1" /> Complete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                    
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-1"
                      onClick={() => onEditTask(task._id)}
                    >
                      <FaEdit />
                    </Button>
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default TasksList;