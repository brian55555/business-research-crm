// src/components/NoteView.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaClock, FaTag, FaExternalLinkAlt, FaGoogle } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../utils/api';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

const NoteView = ({ noteId, onEdit, onDelete, onClose }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadNote();
  }, [noteId]);
  
  const loadNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/${noteId}`);
      setNote(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load note:', err);
      setError('Failed to load note. Please try again.');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP p'); // Format like "Apr 29, 2023, 2:30 PM"
    } catch (e) {
      return dateString;
    }
  };
  
  const renderNoteContent = () => {
    try {
      if (!note || !note.content) return <p>No content available</p>;
      
      // Parse the raw content
      const rawContent = JSON.parse(note.content);
      const contentState = convertFromRaw(rawContent);
      
      // Convert to HTML
      const options = {
        entityStyleFn: (entity) => {
          const entityType = entity.get('type').toLowerCase();
          if (entityType === 'link') {
            const data = entity.getData();
            return {
              element: 'a',
              attributes: {
                href: data.url,
                target: '_blank',
                rel: 'noopener noreferrer'
              }
            };
          }
        }
      };
      
      const html = stateToHTML(contentState, options);
      
      return <div className="note-content" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      console.error('Error rendering note content:', e);
      return <p>Could not render note content. The note may be using an unsupported format.</p>;
    }
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading note...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }
  
  if (!note) {
    return (
      <Alert variant="warning">
        Note not found
      </Alert>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white">
        <h4 className="mb-0">{note.title}</h4>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => onEdit(noteId)}
          >
            <FaEdit /> Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(noteId)}
          >
            <FaTrash /> Delete
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-3 text-muted small d-flex align-items-center">
          <div className="me-3">
            <FaClock className="me-1" />
            Created: {formatDate(note.createdAt)}
          </div>
          <div>
            <FaClock className="me-1" />
            Updated: {formatDate(note.updatedAt)}
          </div>
          {note.googleDriveUrl && (
            <div className="ms-auto">
              <a 
                href={note.googleDriveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary"
              >
                <FaGoogle className="me-1" />
                View in Google Drive
              </a>
            </div>
          )}
        </div>
        
        {renderNoteContent()}
        
        {note.tags && note.tags.length > 0 && (
          <div className="mt-4">
            <div className="mb-2">
              <FaTag className="me-1" />
              <strong>Tags:</strong>
            </div>
            <div>
              {note.tags.map((tag, index) => (
                <Badge 
                  bg="secondary" 
                  key={index} 
                  className="me-2 mb-2 p-2"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-white">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Back to Notes
        </Button>
      </Card.Footer>
      
      <style jsx>{`
        .note-content {
          font-size: 16px;
          line-height: 1.6;
        }
        
        .note-content h1 {
          font-size: 1.8rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .note-content h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .note-content h3 {
          font-size: 1.3rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .note-content blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          color: #666;
          margin: 1rem 0;
        }
        
        .note-content pre {
          background-color: #f6f8fa;
          padding: 16px;
          border-radius: 3px;
          overflow-x: auto;
        }
        
        .note-content img {
          max-width: 100%;
          height: auto;
        }
        
        .note-content hr {
          margin: 2rem 0;
          border-top: 1px solid #ddd;
        }
        
        .note-content ul, .note-content ol {
          margin-bottom: 1rem;
        }
      `}</style>
    </Card>
  );
};

export default NoteView;