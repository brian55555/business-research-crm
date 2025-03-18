// src/components/NewsArticleForm.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const NewsArticleForm = ({ businessId, articleId, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    url: '',
    summary: '',
    publishDate: new Date().toISOString().split('T')[0],
    tags: '',
    business: businessId
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingArticle, setLoadingArticle] = useState(false);
  
  // Load article data if editing
  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);
  
  const loadArticle = async () => {
    try {
      setLoadingArticle(true);
      const response = await api.get(`/news/${articleId}`);
      const article = response.data;
      
      setFormData({
        ...article,
        tags: article.tags ? article.tags.join(', ') : '',
        publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : ''
      });
      
      setLoadingArticle(false);
    } catch (err) {
      console.error('Failed to load article', err);
      setError('Failed to load article');
      setLoadingArticle(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const articleData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      let response;
      if (articleId) {
        response = await api.put(`/news/${articleId}`, articleData);
      } else {
        response = await api.post('/news', articleData);
      }
      
      setLoading(false);
      onSaved(response.data);
    } catch (err) {
      console.error('Failed to save article', err);
      setError(err.response?.data?.message || 'Failed to save article');
      setLoading(false);
    }
  };
  
  if (loadingArticle) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading article...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">{articleId ? 'Edit News Article' : 'Add News Article'}</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title*</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Source</Form.Label>
                <Form.Control
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g. TechCrunch, Wall Street Journal"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Publish Date</Form.Label>
                <Form.Control
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row></Form></Card.Body></Card>)}


export default NewsArticleForm;