// src/components/NotesList.js
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Spinner, Form, InputGroup, Alert, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags, FaFilter, FaThLarge, FaList, FaEllipsisH, FaCalendarAlt, FaStickyNote } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { format, formatDistanceToNow } from 'date-fns';

const NotesList = ({ businessId, onEditNote, onAddNote = () => {} }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [view, setView] = useState('list'); // list or grid
  const [allTags, setAllTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  
  useEffect(() => {
    loadNotes();
  }, [businessId]);
  
  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/business/${businessId}`);
      setNotes(response.data);
      
      // Extract all unique tags
      const tags = new Set();
      response.data.forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load notes', err);
      setError('Failed to load notes');
      setLoading(false);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        loadNotes();
      } catch (err) {
        console.error('Failed to delete note', err);
        setError('Failed to delete note');
      }
    }
  };
  
  // Parse raw content for preview
  const getContentPreview = (rawContent, maxLength = 150) => {
    try {
      if (!rawContent) return '';
      
      const content = JSON.parse(rawContent);
      if (!content.blocks || content.blocks.length === 0) return '';
      
      // Get text from the first few blocks
      let text = '';
      let i = 0;
      
      while (text.length < maxLength && i < content.blocks.length) {
        text += content.blocks[i].text + ' ';
        i++;
      }
      
      // Truncate if necessary
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      
      return text;
    } catch (e) {
      // If parsing fails, return the raw text or empty string
      if (typeof rawContent === 'string') {
        return rawContent.length > maxLength
          ? rawContent.substring(0, maxLength) + '...'
          : rawContent;
      }
      return '';
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP'); // Format like "Apr 29, 2023"
    } catch (e) {
      return dateString;
    }
  };
  
  const formatRelativeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 days ago"
    } catch (e) {
      return '';
    }
  };
  
  // Filter notes
  const filteredNotes = notes.filter(note => {
    // Search filter
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      getContentPreview(note.content).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tag filter
    const matchesTag = !filterTag || (note.tags && note.tags.includes(filterTag));
    
    return matchesSearch && matchesTag;
  });
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading notes...</p>
      </div>
    );
  }
  
  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-3 d-flex flex-wrap align-items-center">
        <div className="me-auto mb-2">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="d-flex ms-md-2 mb-2">
          <Form.Select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="me-2"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </Form.Select>
          <div className="btn-group">
            <Button
              variant={view === 'list' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setView('list')}
              title="List View"
            >
              <FaList />
            </Button>
            <Button
              variant={view === 'grid' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setView('grid')}
              title="Grid View"
            >
              <FaThLarge />
            </Button>
          </div>
        </div>
      </div>
      
      {filteredNotes.length === 0 ? (
        <div className="text-center py-5">
          <FaStickyNote className="display-4 mb-3 text-muted" />
          <p className="mb-3">No notes found.</p>
          <Button
            variant="outline-primary"
            onClick={onAddNote}
          >
            <FaPlus className="me-2" /> Create a new note
          </Button>
        </div>
      ) : view === 'list' ? (
        <ListGroup>
          {filteredNotes.map((note) => (
            <ListGroup.Item key={note._id} className="py-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="me-auto">
                  <h5>{note.title}</h5>
                  <p className="text-muted mb-2">
                    {getContentPreview(note.content)}
                  </p>
                  <div>
                    {note.tags && note.tags.map((tag, index) => (
                      <Badge 
                        bg="secondary" 
                        key={index} 
                        className="me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFilterTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2">
                    <FaCalendarAlt className="me-1" />
                    Updated {formatRelativeDate(note.updatedAt)}
                  </small>
                </div>
                <div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-1"
                    onClick={() => onEditNote(note._id)}
                    title="Edit Note"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteNote(note._id)}
                    title="Delete Note"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Row>
          {filteredNotes.map((note) => (
            <Col md={6} lg={4} key={note._id} className="mb-3">
              <Card className="h-100 note-card">
                <Card.Body>
                  <Card.Title>{note.title}</Card.Title>
                  <Card.Text className="text-truncate">
                    {getContentPreview(note.content, 100)}
                  </Card.Text>
                  <div className="mb-3">
                    {note.tags && note.tags.map((tag, index) => (
                      <Badge 
                        bg="secondary" 
                        key={index} 
                        className="me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFilterTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <small className="text-muted d-block">
                    <FaCalendarAlt className="me-1" />
                    {formatDate(note.updatedAt)}
                  </small>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-1"
                      onClick={() => onEditNote(note._id)}
                      title="Edit Note"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteNote(note._id)}
                      title="Delete Note"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <style jsx>{`
        .note-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .note-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default NotesList;
