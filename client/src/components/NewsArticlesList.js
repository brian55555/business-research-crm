// src/components/NewsArticlesList.js
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Spinner, Form, InputGroup, Alert } from 'react-bootstrap';
import { FaSearch, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import { format } from 'date-fns';

const NewsArticlesList = ({ businessId }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadArticles();
  }, [businessId]);
  
  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/news/business/${businessId}`);
      setArticles(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load news articles', err);
      setError('Failed to load news articles');
      setLoading(false);
    }
  };
  
  const handleDeleteArticle = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await api.delete(`/news/${articleId}`);
        loadArticles();
      } catch (err) {
        console.error('Failed to delete news article', err);
        setError('Failed to delete news article');
      }
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Filter articles based on search term
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading news articles...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        
        {filteredArticles.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-0">No news articles found.</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {filteredArticles.map((article) => (
              <ListGroup.Item key={article._id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{article.title}</h5>
                    <div className="text-muted mb-2">
                      <span className="me-3">Source: {article.source}</span>
                      <span>Published: {formatDate(article.publishDate)}