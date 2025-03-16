// src/components/NotesManager.js
import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import NotesList from './NotesList';
import NotionEditor from './NotionEditor';
import NoteView from './NoteView';
import api from '../utils/api';

const NotesManager = ({ businessId }) => {
  const [currentView, setCurrentView] = useState('list'); // list, edit, view
  const [currentNoteId, setCurrentNoteId] = useState(null);
  
  const handleAddNote = () => {
    setCurrentNoteId(null);
    setCurrentView('edit');
  };
  
  const handleEditNote = (noteId) => {
    setCurrentNoteId(noteId);
    setCurrentView('edit');
  };
  
  const handleViewNote = (noteId) => {
    setCurrentNoteId(noteId);
    setCurrentView('view');
  };
  
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        setCurrentView('list');
      } catch (err) {
        console.error('Failed to delete note', err);
      }
    }
  };
  
  const handleNoteSaved = () => {
    setCurrentView('list');
  };
  
  const handleBackToList = () => {
    setCurrentView('list');
  };
  
  return (
    <Container fluid className="px-0">
      {currentView === 'list' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Research Notes</h3>
            <Button 
              variant="primary" 
              onClick={handleAddNote}
            >
              <FaPlus className="me-2" /> New Note
            </Button>
          </div>
          <NotesList 
            businessId={businessId} 
            onEditNote={handleEditNote}
            onViewNote={handleViewNote}
            onAddNote={handleAddNote}
          />
        </>
      )}
      
      {currentView === 'edit' && (
        <>
          <div className="mb-3">
            <Button
              variant="outline-secondary"
              onClick={handleBackToList}
              className="mb-3"
            >
              <FaArrowLeft className="me-2" /> Back to Notes
            </Button>
          </div>
          <NotionEditor
            businessId={businessId}
            noteId={currentNoteId}
            onSaved={handleNoteSaved}
            onCancel={handleBackToList}
          />
        </>
      )}
      
      {currentView === 'view' && (
        <>
          <NoteView
            noteId={currentNoteId}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onClose={handleBackToList}
          />
        </>
      )}
    </Container>
  );
};

export default NotesManager;