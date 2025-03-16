// src/components/ContactsList.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Form, InputGroup, Alert, Modal, Row, Col, Nav } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaPhoneAlt, FaEnvelope, FaLinkedin, FaTwitter, FaCalendarPlus, FaStar, FaRegStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ContactForm from './ContactForm';
import InteractionForm from './InteractionForm';

const ContactsList = ({ businessId }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionContact, setInteractionContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [view, setView] = useState('table');
  
  useEffect(() => {
    loadContacts();
  }, [businessId]);
  
  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get(businessId 
        ? `/contacts/business/${businessId}` 
        : '/contacts');
      
      setContacts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load contacts', err);
      setError('Failed to load contacts');
      setLoading(false);
    }
  };
  
  const handleContactSaved = () => {
    setShowContactForm(false);
    setCurrentContact(null);
    loadContacts();
  };
  
  const handleContactCancel = () => {
    setShowContactForm(false);
    setCurrentContact(null);
  };
  
  const editContact = (contact) => {
    setCurrentContact(contact);
    setShowContactForm(true);
  };
  
  const addInteraction = (contact) => {
    setInteractionContact(contact);
    setShowInteractionForm(true);
  };
  
  const handleInteractionSaved = () => {
    setShowInteractionForm(false);
    setInteractionContact(null);
    loadContacts();
  };
  
  const handleInteractionCancel = () => {
    setShowInteractionForm(false);
    setInteractionContact(null);
  };
  
  const showContact = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };
  
  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${contactId}`);
        loadContacts();
      } catch (err) {
        console.error('Failed to delete contact', err);
        setError('Failed to delete contact');
      }
    }
  };
  
  const togglePrimaryContact = async (contact) => {
    try {
      await api.put(`/contacts/${contact._id}`, {
        ...contact,
        isPrimary: !contact.isPrimary
      });
      loadContacts();
    } catch (err) {
      console.error('Failed to update contact', err);
      setError('Failed to update contact');
    }
  };
  
  const getRelationshipBadgeColor = (strength) => {
    switch (strength) {
      case 'New': return 'secondary';
      case 'Connected': return 'info';
      case 'Engaged': return 'primary';
      case 'Strong': return 'success';
      case 'Advocate': return 'warning';
      default: return 'secondary';
    }
  };
  
  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    // Search filter
    const fullName = `${contact.firstName} ${contact.lastName}`;
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Relationship filter
    const matchesRelationship = !filterRelationship || contact.relationshipStrength === filterRelationship;
    
    return matchesSearch && matchesRelationship;
  });
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading contacts...</p>
      </div>
    );
  }
  
  if (showContactForm) {
    return (
      <ContactForm 
        businessId={businessId}
        contact={currentContact}
        onSaved={handleContactSaved}
        onCancel={handleContactCancel}
      />
    );
  }
  
  if (showInteractionForm) {
    return (
      <InteractionForm
        contact={interactionContact}
        onSaved={handleInteractionSaved}
        onCancel={handleInteractionCancel}
      />
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Contacts</h5>
        <div className="d-flex">
          <div className="btn-group me-2">
            <Button 
              variant={view === 'table' ? 'primary' : 'outline-primary'} 
              size="sm"
              onClick={() => setView('table')}
            >
              Table
            </Button>
            <Button 
              variant={view === 'cards' ? 'primary' : 'outline-primary'} 
              size="sm"
              onClick={() => setView('cards')}
            >
              Cards
            </Button>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              setCurrentContact(null);
              setShowContactForm(true);
            }}
          >
            <FaPlus className="me-1" /> Add Contact
          </Button>
        </div>
      </Card.Header>
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
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="ms-md-2 mb-2">
            <Form.Select
              value={filterRelationship}
              onChange={(e) => setFilterRelationship(e.target.value)}
            >
              <option value="">All Relationships</option>
              <option value="New">New</option>
              <option value="Connected">Connected</option>
              <option value="Engaged">Engaged</option>
              <option value="Strong">Strong</option>
              <option value="Advocate">Advocate</option>
            </Form.Select>
          </div>
        </div>
        
        {filteredContacts.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-3">No contacts found.</p>
            <Button 
              variant="outline-primary"
              onClick={() => {
                setCurrentContact(null);
                setShowContactForm(true);
              }}
            >
              <FaPlus className="me-2" /> Add your first contact
            </Button>
          </div>
        ) : view === 'table' ? (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Position</th>
                  {!businessId && <th>Company</th>}
                  <th>Contact Info</th>
                  <th>Relationship</th>
                  <th>Last Contacted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => togglePrimaryContact(contact)}
                        title={contact.isPrimary ? "Primary Contact" : "Make Primary Contact"}
                      >
                        {contact.isPrimary ? (
                          <FaStar className="text-warning" />
                        ) : (
                          <FaRegStar className="text-muted" />
                        )}
                      </Button>
                    </td>
                    <td>
                      <div style={{cursor: 'pointer'}} onClick={() => showContact(contact)}>
                        {contact.firstName} {contact.lastName}
                      </div>
                    </td>
                    <td>{contact.position}</td>
                    {!businessId && (
                      <td>
                        {contact.company ? (
                          <Link to={`/businesses/${contact.company._id}`}>
                            {contact.company.name}
                          </Link>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    )}
                    <td>
                      <div className="d-flex">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="me-2" title={contact.email}>
                            <FaEnvelope />
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="me-2" title={contact.phone}>
                            <FaPhoneAlt />
                          </a>
                        )}
                        {contact.linkedIn && (
                          <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="me-2" title="LinkedIn Profile">
                            <FaLinkedin />
                          </a>
                        )}
                        {contact.twitter && (
                          <a href={contact.twitter} target="_blank" rel="noopener noreferrer" title="Twitter Profile">
                            <FaTwitter />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getRelationshipBadgeColor(contact.relationshipStrength)}>
                        {contact.relationshipStrength}
                      </Badge>
                    </td>
                    <td>
                      {getFormattedDate(contact.lastContacted)}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => addInteraction(contact)}
                        title="Add Interaction"
                      >
                        <FaCalendarPlus />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => editContact(contact)}
                        title="Edit Contact"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteContact(contact._id)}
                        title="Delete Contact"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Row>
            {filteredContacts.map((contact) => (
              <Col md={6} lg={4} xl={3} key={contact._id} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                    <h6 className="mb-0">
                      {contact.isPrimary && <FaStar className="text-warning me-1" />}
                      {contact.firstName} {contact.lastName}
                    </h6>
                    <Badge bg={getRelationshipBadgeColor(contact.relationshipStrength)}>
                      {contact.relationshipStrength}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted mb-2">{contact.position}</p>
                    {!businessId && contact.company && (
                      <p className="mb-2">
                        <strong>Company:</strong>{' '}
                        <Link to={`/businesses/${contact.company._id}`}>
                          {contact.company.name}
                        </Link>
                      </p>
                    )}
                    
                    {contact.email && (
                      <p className="mb-1">
                        <FaEnvelope className="me-2" />
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </p>
                    )}
                    
                    {contact.phone && (
                      <p className="mb-1">
                        <FaPhoneAlt className="me-2" />
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </p>
                    )}
                    
                    <div className="mt-3 d-flex">
                      {contact.linkedIn && (
                        <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="me-3" title="LinkedIn Profile">
                          <FaLinkedin size={20} />
                        </a>
                      )}
                      {contact.twitter && (
                        <a href={contact.twitter} target="_blank" rel="noopener noreferrer" title="Twitter Profile">
                          <FaTwitter size={20} />
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <small className="text-muted">
                        Last contacted: {getFormattedDate(contact.lastContacted)}
                      </small>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white d-flex justify-content-between">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => addInteraction(contact)}
                    >
                      <FaCalendarPlus className="me-1" /> Interaction
                    </Button>
                    <div>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => editContact(contact)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteContact(contact._id)}
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
      </Card.Body>
      
      {/* Contact Detail Modal */}
      <Modal
        show={showContactDetail}
        onHide={() => setShowContactDetail(false)}
        size="lg"
      >
        {selectedContact && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedContact.isPrimary && <FaStar className="text-warning me-1" />}
                {selectedContact.firstName} {selectedContact.lastName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">Contact Information</h5>
                  
                  <p>
                    <strong>Position:</strong> {selectedContact.position || 'N/A'}
                  </p>
                  
                  {selectedContact.department && (
                    <p>
                      <strong>Department:</strong> {selectedContact.department}
                    </p>
                  )}
                  
                  {!businessId && selectedContact.company && (
                    <p>
                      <strong>Company:</strong>{' '}
                      <Link to={`/businesses/${selectedContact.company._id}`}>
                        {selectedContact.company.name}
                      </Link>
                    </p>
                  )}
                  
                  <p>
                    <strong>Relationship:</strong>{' '}
                    <Badge bg={getRelationshipBadgeColor(selectedContact.relationshipStrength)}>
                      {selectedContact.relationshipStrength}
                    </Badge>
                  </p>
                  
                  <hr />
                  
                  <h6>Contact Details</h6>
                  
                  {selectedContact.email && (
                    <p>
                      <FaEnvelope className="me-2" />
                      <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                    </p>
                  )}
                  
                  {selectedContact.phone && (
                    <p>
                      <FaPhoneAlt className="me-2" />
                      <a href={`tel:${selectedContact.phone}`}>{selectedContact.phone}</a>
                    </p>
                  )}
                  
                  {selectedContact.mobile && (
                    <p>
                      <FaPhoneAlt className="me-2" />
                      <a href={`tel:${selectedContact.mobile}`}>{selectedContact.mobile}</a> (Mobile)
                    </p>
                  )}
                  
                  <div className="mt-3">
                    {selectedContact.linkedIn && (
                      <a href={selectedContact.linkedIn} target="_blank" rel="noopener noreferrer" className="me-3" title="LinkedIn Profile">
                        <FaLinkedin size={24} />
                      </a>
                    )}
                    {selectedContact.twitter && (
                      <a href={selectedContact.twitter} target="_blank" rel="noopener noreferrer" title="Twitter Profile">
                        <FaTwitter size={24} />
                      </a>
                    )}
                  </div>
                  
                  {selectedContact.notes && (
                    <>
                      <hr />
                      <h6>Notes</h6>
                      <p>{selectedContact.notes}</p>
                    </>
                  )}
                  
                  {selectedContact.tags && selectedContact.tags.length > 0 && (
                    <>
                      <hr />
                      <h6>Tags</h6>
                      <div>
                        {selectedContact.tags.map((tag, index) => (
                          <Badge bg="secondary" key={index} className="me-1 mb-1">{tag}</Badge>
                        ))}
                      </div>
                    </>
                  )}
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">Interaction History</h5>
                  
                  <div className="mb-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setShowContactDetail(false);
                        addInteraction(selectedContact);
                      }}
                    >
                      <FaCalendarPlus className="me-1" /> Add Interaction
                    </Button>
                  </div>
                  
                  {selectedContact.interactions && selectedContact.interactions.length > 0 ? (
                    <div className="timeline">
                      {selectedContact.interactions
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((interaction, index) => (
                          <div key={interaction._id || index} className="timeline-item mb-3 pb-3 border-bottom">
                            <div className="d-flex justify-content-between">
                              <Badge bg={
                                interaction.type === 'Email' ? 'info' :
                                interaction.type === 'Call' ? 'success' :
                                interaction.type === 'Meeting' ? 'primary' :
                                interaction.type === 'Social' ? 'warning' : 'secondary'
                              }>
                                {interaction.type}
                              </Badge>
                              <small>{new Date(interaction.date).toLocaleString()}</small>
                            </div>
                            {interaction.notes && (
                              <p className="mt-2 mb-1">{interaction.notes}</p>
                            )}
                            {interaction.outcome && (
                              <p className="mb-0">
                                <strong>Outcome:</strong> {interaction.outcome}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted">No interactions recorded yet.</p>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => setShowContactDetail(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowContactDetail(false);
                  editContact(selectedContact);
                }}
              >
                <FaEdit className="me-1" /> Edit Contact
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Card>
  );
};

export default ContactsList;