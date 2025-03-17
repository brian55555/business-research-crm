// src/components/NoteEditor.js
import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import { Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaSave, FaTag, FaTrash } from 'react-icons/fa';
import api from '../utils/api';

const NoteEditor = ({ businessId, noteId, onSaved, onCancel }) => {
  const [note, setNote] = useState({
    title: '',
    content: '',
    tags: [],
    business: businessId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noteId) {
      setLoading(true);
      api.get(`/notes/${noteId}`)
        .then(response => {
          setNote(response.data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load note');
          setLoading(false);
          console.error(err);
        });
    }
  }, [noteId]);

  const handleContentChange = (content) => {
    setNote(prev => ({ ...prev, content }));
  };

  const handleTitleChange = (e) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  };

  const addTag = () => {
    if (newTag && !note.tags.includes(newTag)) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      let response;
      if (noteId) {
        response = await api.put(`/notes/${noteId}`, note);
      } else {
        response = await api.post('/notes', note);
      }
      setIsSaving(false);
      onSaved(response.data);
    } catch (err) {
      setError('Failed to save note');
      setIsSaving(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading business details...</p>
      </Container>
    ); (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={note.title}
            onChange={handleTitleChange}
            placeholder="Note title"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <RichTextEditor
            value={note.content}
            onChange={handleContentChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags</Form.Label>
          <div className="d-flex mb-2">
            <Form.Control
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button 
              variant="outline-secondary" 
              onClick={addTag}
              className="ms-2"
            >
              <FaTag /> Add
            </Button>
          </div>
          <div>
            {note.tags.map((tag, index) => (
              <Badge 
                bg="primary" 
                className="me-2 mb-2 p-2" 
                key={index}
                style={{ cursor: 'pointer' }}
                onClick={() => removeTag(tag)}
              >
                {tag} <FaTrash size={10} />
              </Badge>
            ))}
          </div>
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            className="me-2"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Save Note
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default NoteEditor;
