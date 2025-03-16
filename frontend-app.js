

  return (
    <Container className="py-4">
      {editMode ? (
        <BusinessForm 
          businessData={business} 
          onSave={handleBusinessUpdate} 
          onCancel={() => setEditMode(false)} 
        />
      ) : showNoteEditor ? (
        <NoteEditor 
          businessId={id} 
          noteId={currentNoteId} 
          onSaved={handleNoteSaved} 
          onCancel={() => {
            setShowNoteEditor(false);
            setCurrentNoteId(null);
          }} 
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
                        <hr />
                        <h5>Key Contacts</h5>
                        {business?.contacts && business.contacts.length > 0 ? (
                          business.contacts.map((contact, index) => (
                            <Card className="mb-2" key={index}>
                              <Card.Body>
                                <h6>{contact.name}</h6>
                                <p className="mb-1"><strong>Position:</strong> {contact.position}</p>
                                <p className="mb-1"><strong>Email:</strong> {contact.email}</p>
                                <p className="mb-1"><strong>Phone:</strong> {contact.phone}</p>
                                {contact.linkedin && (
                                  <p className="mb-0"><strong>LinkedIn:</strong> <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">{contact.linkedin}</a></p>
                                )}
                              </Card.Body>
                            </Card>
                          ))
                        ) : (
                          <p>No contacts added yet.</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                  <Tab.Pane eventKey="notes">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3>Research Notes</h3>
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          setCurrentNoteId(null);
                          setShowNoteEditor(true);
                        }}
                      >
                        <FaPlus className="me-2" /> New Note
                      </Button>
                    </div>
                    <NotesList businessId={id} onEditNote={handleEditNote} />
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
                    <TasksList businessId={id} onEditTask={handleEditTask} />
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

export default BusinessDetail;// src/components/RichTextEditor.js
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, height = 500 }) => {
  const editorRef = useRef(null);
  
  return (
    <Editor
      apiKey="your-tinymce-api-key"
      onInit={(evt, editor) => editorRef.current = editor}
      initialValue={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  );
};

export default RichTextEditor;

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

// src/components/BusinessDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Tab, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaDownload, FaNewspaper, FaTasks, FaBuilding } from 'react-icons/fa';
import api from '../utils/api';
import BusinessForm from './BusinessForm';
import NoteEditor from './NoteEditor';
import NotesList from './NotesList';
import DocumentsList from './DocumentsList';
import DocumentUpload from './DocumentUpload';
import NewsArticlesList from './NewsArticlesList';
import NewsArticleForm from './NewsArticleForm';
import TasksList from './TasksList';
import TaskForm from './TaskForm';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
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
      setLoading(false);
      // Handle error (show message, redirect, etc.)
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
        // Handle error
      }
    }
  };

  const handleNoteSaved = () => {
    setShowNoteEditor(false);
    setCurrentNoteId(null);
    // Refresh notes list if needed
  };

  const handleEditNote = (noteId) => {
    setCurrentNoteId(noteId);
    setShowNoteEditor(true);
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
    return