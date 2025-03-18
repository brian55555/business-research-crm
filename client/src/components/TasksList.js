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
                onChange={(e) => setSearchTerm(e.target.value)}></Form.Control></InputGroup></div></div></Card.Body></Card>)}