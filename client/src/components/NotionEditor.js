// src/components/NotionEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Alert, Dropdown, Form, Badge } from 'react-bootstrap';
import { FaSave, FaImage, FaCode, FaTable, FaList, FaListOl, FaQuoteLeft, 
  FaDivide, FaHeading, FaPlus, FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaLink, FaAlignLeft, FaAlignCenter, FaAlignRight, FaEllipsisH, FaTimes } from 'react-icons/fa';
import Editor from '@draft-js-plugins/editor';
import { EditorState, RichUtils, AtomicBlockUtils, convertToRaw, convertFromRaw } from 'draft-js';
import createLinkifyPlugin from '@draft-js-plugins/linkify';
import createImagePlugin from '@draft-js-plugins/image';
import createBlockDndPlugin from '@draft-js-plugins/drag-n-drop';
import createFocusPlugin from '@draft-js-plugins/focus';
import createResizeablePlugin from '@draft-js-plugins/resizeable';
import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/linkify/lib/plugin.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

// Initialize plugins
const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const linkifyPlugin = createLinkifyPlugin();
const imagePlugin = createImagePlugin({
  decorator: focusPlugin.decorator,
});

const plugins = [
  focusPlugin,
  resizeablePlugin,
  blockDndPlugin,
  linkifyPlugin,
  imagePlugin,
];

const NotionEditor = ({ businessId, noteId, onSaved, onCancel }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!noteId);
  const [error, setError] = useState(null);
  const [blockType, setBlockType] = useState('unstyled');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const editor = useRef(null);
  const linkInputRef = useRef(null);
  const { user } = useAuth();

  // Load note data if editing an existing note
  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  // Focus link input when shown
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const loadNote = async () => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      const note = response.data;
      
      setTitle(note.title);
      setTags(note.tags || []);
      
      if (note.content) {
        try {
          // Try to parse the content as Draft.js raw state
          const contentState = convertFromRaw(JSON.parse(note.content));
          setEditorState(EditorState.createWithContent(contentState));
        } catch (e) {
          // If that fails, create a new editor with the content as plain text
          setEditorState(EditorState.createEmpty());
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load note:', err);
      setError('Failed to load note. Please try again.');
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleEditorChange = (state) => {
    const contentState = state.getCurrentContent();
    setShowPlaceholder(
      !contentState.hasText() && 
      contentState.getBlockMap().first().getType() === 'unstyled'
    );
    setEditorState(state);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleReturn = (e) => {
    if (e.shiftKey) {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }
    
    // Handle special block types on enter
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const blockType = currentBlock.getType();
    
    if (blockType === 'header-one' || 
        blockType === 'header-two' || 
        blockType === 'header-three') {
      if (currentBlock.getText().length === 0) {
        // Change to normal text if heading is empty
        const newEditorState = RichUtils.toggleBlockType(editorState, 'unstyled');
        setEditorState(newEditorState);
        return 'handled';
      }
    }
    
    return 'not-handled';
  };

  const handleBeforeInput = (char) => {
    if (char !== ' ') return 'not-handled';
    
    // Handle Markdown-style shortcuts
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock= contentState.getBlockForKey(selection.getStartKey());
    const blockLength = currentBlock.getLength();
    
    if (selection.getAnchorOffset() !== blockLength) return 'not-handled';
    
    const blockText = currentBlock.getText();
    
    // Heading shortcuts
    if (blockText === '#') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'header-one'
      ));
      return 'handled';
    }
    
    if (blockText === '##') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'header-two'
      ));
      return 'handled';
    }
    
    if (blockText === '###') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'header-three'
      ));
      return 'handled';
    }
    
    // List shortcuts
    if (blockText === '-' || blockText === '*') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'unordered-list-item'
      ));
      return 'handled';
    }
    
    if (blockText === '1.') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'ordered-list-item'
      ));
      return 'handled';
    }
    
    // Quote shortcut
    if (blockText === '>') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'blockquote'
      ));
      return 'handled';
    }
    
    // Code block shortcut
    if (blockText === '```') {
      setEditorState(RichUtils.toggleBlockType(
        EditorState.push(
          editorState,
          contentState.createEntity('IMMUTABLE', {}),
          'replace-text'
        ),
        'code-block'
      ));
      return 'handled';
    }
    
    // Divider shortcut
    if (blockText === '---') {
      handleAddDivider();
      return 'handled';
    }
    
    return 'not-handled';
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleInlineStyle = (style) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // You would replace this with your image upload service
          // For this example, we'll simulate it
          const imageUrl = await uploadImage(file);
          
          const contentState = editorState.getCurrentContent();
          const contentStateWithEntity = contentState.createEntity(
            'IMAGE',
            'IMMUTABLE',
            { src: imageUrl, alt: file.name }
          );
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const newEditorState = EditorState.set(
            editorState,
            { currentContent: contentStateWithEntity }
          );
          
          setEditorState(AtomicBlockUtils.insertAtomicBlock(
            newEditorState,
            entityKey,
            ' '
          ));
        } catch (error) {
          console.error('Failed to upload image:', error);
          setError('Failed to upload image. Please try again.');
        }
      }
    };
    input.click();
  };

  // Mock image upload function - replace with your actual implementation
  const uploadImage = async (file) => {
    // In a real app, you would upload to your server or cloud storage
    return new Promise((resolve) => {
      // Simulate server response with a timeout
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }, 1000);
    });
  };

  const handleAddLink = () => {
    setShowLinkInput(true);
  };

  const confirmLink = (e) => {
    e.preventDefault();
    
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      { url: linkUrl }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { 
      currentContent: contentStateWithEntity 
    });
    
    setEditorState(RichUtils.toggleLink(
      newEditorState,
      newEditorState.getSelection(),
      entityKey
    ));
    
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const cancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const handleAddDivider = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'DIVIDER',
      'IMMUTABLE',
      {}
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity }
    );
    
    setEditorState(AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' '
    ));
  };

  const handleAddTable = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'TABLE',
      'IMMUTABLE',
      { rows: 3, cols: 3 }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity }
    );
    
    setEditorState(AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' '
    ));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your note');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      const noteData = {
        title,
        content: rawContent,
        tags,
        business: businessId,
      };
      
      let response;
      if (noteId) {
        response = await api.put(`/notes/${noteId}`, noteData);
      } else {
        response = await api.post('/notes', noteData);
      }
      
      setSaving(false);
      onSaved(response.data);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Failed to save note. Please try again.');
      setSaving(false);
    }
  };

  const showBlockMenuAt = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setShowBlockMenu(true);
  };

  // Custom block renderer for atomic blocks
  const blockRenderer = (block) => {
    if (block.getType() === 'atomic') {
      const contentState = editorState.getCurrentContent();
      const entity = contentState.getEntity(block.getEntityAt(0));
      const type = entity.getType();
      const data = entity.getData();
      
      if (type === 'IMAGE') {
        return {
          component: ImageComponent,
          editable: false,
          props: {
            src: data.src,
            alt: data.alt,
          },
        };
      }
      
      if (type === 'DIVIDER') {
        return {
          component: DividerComponent,
          editable: false,
        };
      }
      
      if (type === 'TABLE') {
        return {
          component: TableComponent,
          editable: false,
          props: {
            rows: data.rows,
            cols: data.cols,
          },
        };
      }
    }
    
    return null;
  };

  // Component for displaying images in the editor
  const ImageComponent = (props) => {
    return (
      <div className="editor-image-wrapper">
        <img 
          src={props.blockProps.src} 
          alt={props.blockProps.alt || ''} 
          className="img-fluid my-2"
        />
      </div>
    );
  };

  // Component for displaying dividers in the editor
  const DividerComponent = () => {
    return <hr className="my-4" />;
  };

  // Simple table component for the editor
  const TableComponent = (props) => {
    const { rows, cols } = props.blockProps;
    
    return (
      <div className="table-responsive my-3">
        <table className="table table-bordered">
          <tbody>
            {Array(rows).fill().map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array(cols).fill().map((_, colIndex) => (
                  <td key={colIndex} className="p-2">
                    {rowIndex === 0 ? 'Header' : 'Cell'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get the class names for the block type buttons
  const getBlockTypeButtonClass = (blockType) => {
    const selection = editorState.getSelection();
    const currentBlockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    
    return currentBlockType === blockType ? 'active' : '';
  };

  // Get the class names for the inline style buttons
  const getInlineStyleButtonClass = (style) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(style) ? 'active' : '';
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading note editor...</p>
      </div>
    );
  }

  return (
    <div className="notion-editor">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          )}
          
          {/* Title field */}
          <div className="p-3 border-bottom">
            <Form.Control
              type="text"
              className="form-control-lg border-0 px-0 fw-bold"
              placeholder="Untitled"
              value={title}
              onChange={handleTitleChange}
              style={{ boxShadow: 'none' }}
            />
          </div>
          
          {/* Toolbar */}
          <div className="editor-toolbar p-2 border-bottom d-flex flex-wrap">
            <div className="me-3 mb-1">
              <Dropdown>
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-text-style">
                  {blockType === 'header-one' ? 'Heading 1' :
                   blockType === 'header-two' ? 'Heading 2' :
                   blockType === 'header-three' ? 'Heading 3' :
                   blockType === 'unordered-list-item' ? 'Bullet List' :
                   blockType === 'ordered-list-item' ? 'Numbered List' :
                   blockType === 'blockquote' ? 'Quote' :
                   blockType === 'code-block' ? 'Code' :
                   'Normal Text'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => toggleBlockType('unstyled')}>
                    Normal Text
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleBlockType('header-one')}>
                    Heading 1
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleBlockType('header-two')}>
                    Heading 2
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleBlockType('header-three')}>
                    Heading 3
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => toggleBlockType('unordered-list-item')}>
                    <FaList className="me-2" /> Bullet List
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleBlockType('ordered-list-item')}>
                    <FaListOl className="me-2" /> Numbered List
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleBlockType('blockquote')}>
                    <FaQuoteLeft className="me-2" /> Quote
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleBlockType('code-block')}>
                    <FaCode className="me-2" /> Code
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            
            <div className="btn-group me-3 mb-1">
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => toggleInlineStyle('BOLD')}
                className={getInlineStyleButtonClass('BOLD')}
                title="Bold"
              >
                <FaBold />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => toggleInlineStyle('ITALIC')}
                className={getInlineStyleButtonClass('ITALIC')}
                title="Italic"
              >
                <FaItalic />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => toggleInlineStyle('UNDERLINE')}
                className={getInlineStyleButtonClass('UNDERLINE')}
                title="Underline"
              >
                <FaUnderline />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => toggleInlineStyle('STRIKETHROUGH')}
                className={getInlineStyleButtonClass('STRIKETHROUGH')}
                title="Strikethrough"
              >
                <FaStrikethrough />
              </Button>
            </div>
            
            <div className="btn-group me-3 mb-1">
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddLink}
                title="Add Link"
              >
                <FaLink />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddImage}
                title="Add Image"
              >
                <FaImage />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddTable}
                title="Add Table"
              >
                <FaTable />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddDivider}
                title="Add Divider"
              >
                <FaDivide />
              </Button>
            </div>
            
            <div className="ms-auto mb-1">
              <Button 
                variant="light" 
                size="sm"
                onClick={showBlockMenuAt}
                title="Add Block"
              >
                <FaPlus />
              </Button>
            </div>
          </div>
          
          {/* Link Input Form */}
          {showLinkInput && (
            <div className="p-2 bg-light border-bottom">
              <Form onSubmit={confirmLink}>
                <div className="d-flex">
                  <Form.Control
                    ref={linkInputRef}
                    type="text"
                    placeholder="Enter link URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="me-2"
                  />
                  <Button 
                    variant="primary" 
                    size="sm" 
                    type="submit"
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={cancelLink}
                    className="ms-1"
                  >
                    <FaTimes />
                  </Button>
                </div>
              </Form>
            </div>
          )}
          
          {/* Editor */}
          <div className="editor-content p-3" onClick={() => editor.current.focus()}>
            <Editor
              editorState={editorState}
              onChange={handleEditorChange}
              handleKeyCommand={handleKeyCommand}
              handleReturn={handleReturn}
              handleBeforeInput={handleBeforeInput}
              blockRendererFn={blockRenderer}
              plugins={plugins}
              ref={editor}
              placeholder="Type '/' for commands..."
            />
            
            {showPlaceholder && (
              <div className="editor-placeholder">
                Type '/' for commands...
              </div>
            )}
          </div>
          
          {/* Block Menu */}
          {showBlockMenu && (
            <div 
              className="block-menu-dropdown" 
              style={{ 
                position: 'absolute',
                top: menuPosition.top,
                left: menuPosition.left,
                zIndex: 1000,
                minWidth: '200px',
                backgroundColor: 'white',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                borderRadius: '4px',
              }}
            >
              <div className="p-2 border-bottom">
                <strong>Add blocks</strong>
              </div>
              <ul className="list-unstyled mb-0">
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    toggleBlockType('header-one');
                    setShowBlockMenu(false);
                  }}
                >
                  <FaHeading className="me-2" /> Heading 1
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    toggleBlockType('header-two');
                    setShowBlockMenu(false);
                  }}
                >
                  <FaHeading className="me-2" style={{ fontSize: '0.9em' }} /> Heading 2
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    toggleBlockType('unordered-list-item');
                    setShowBlockMenu(false);
                  }}
                >
                  <FaList className="me-2" /> Bullet List
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    toggleBlockType('ordered-list-item');
                    setShowBlockMenu(false);
                  }}
                >
                  <FaListOl className="me-2" /> Numbered List
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    handleAddDivider();
                    setShowBlockMenu(false);
                  }}
                >
                  <FaDivide className="me-2" /> Divider
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    handleAddImage();
                    setShowBlockMenu(false);
                  }}
                >
                  <FaImage className="me-2" /> Image
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    handleAddTable();
                    setShowBlockMenu(false);
                  }}
                >
                  <FaTable className="me-2" /> Table
                </li>
                <li 
                  className="p-2 hover-bg-light"
                  onClick={() => {
                    toggleBlockType('code-block');
                    setShowBlockMenu(false);
                  }}
                >
                  <FaCode className="me-2" /> Code
                </li>
              </ul>
            </div>
          )}
          
          {/* Tags */}
          <div className="p-3 border-top">
            <Form.Label>Tags</Form.Label>
            <div className="d-flex flex-wrap mb-2">
              {tags.map((tag, index) => (
                <Badge 
                  bg="secondary" 
                  className="me-2 mb-2 p-2" 
                  key={index}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} <FaTimes size={10} />
                </Badge>
              ))}
            </div>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="me-2"
              />
              <Button 
                variant="outline-secondary" 
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Footer with actions */}
          <div className="p-3 border-top d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="me-2"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
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
      
      {/* Add click handler to close block menu */}
      {showBlockMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowBlockMenu(false)}
        />
      )}
      
      {/* CSS for editor */}
      <style jsx>{`
        .notion-editor .editor-content {
          min-height: 300px;
          position: relative;
        }
        
        .notion-editor .editor-placeholder {
          position: absolute;
          top: 3rem;
          left: 3rem;
          color: #aaa;
          pointer-events: none;
        }
        
        .notion-editor .editor-toolbar button.active {
          background-color: #e9ecef;
        }
        
        .notion-editor .hover-bg-light:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }
        
        .notion-editor blockquote {
          border-left: 5px solid #eee;
          padding-left: 10px;
          margin-left: 0;
          color: #666;
        }
        
        .notion-editor .public-DraftEditor-content {
          min-height: 200px;
        }
        
        .notion-editor .public-DraftEditor-content > div > div > div > .public-DraftStyleDefault-block {
          margin-bottom: 0.5rem;
        }
        
        .notion-editor pre {
          background-color: #f6f8fa;
          padding: 16px;
          border-radius: 3px;
          font-family: monospace;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default NotionEditor;