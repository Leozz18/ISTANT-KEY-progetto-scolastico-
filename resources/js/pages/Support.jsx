import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/support.css';

export default function Support({ auth }) {
  const [activeTab, setActiveTab] = useState('faq');
  const [faq, setFaq] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchFAQ();
    if (auth?.user) {
      fetchTickets();
    }
  }, []);

  const fetchFAQ = async () => {
    try {
      const response = await axios.get('/api/support/faq');
      setFaq(response.data);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/support/tickets', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setFormData({ title: '', description: '', priority: 'medium' });
      setSubmitted(true);
      fetchTickets();

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      alert('Error submitting ticket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Support Center</h1>

          <div className="support-tabs">
            <button
              onClick={() => setActiveTab('faq')}
              className={`tab ${activeTab === 'faq' ? 'active' : ''}`}
            >
              FAQ
            </button>
            {auth?.user && (
              <>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
                >
                  My Tickets
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
                >
                  Contact Us
                </button>
              </>
            )}
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {faq.map(item => (
                  <details key={item.id} className="faq-item">
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* My Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="tickets-section">
              <h2>My Support Tickets</h2>
              {tickets.length === 0 ? (
                <p>No tickets yet</p>
              ) : (
                <div className="tickets-list">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-header">
                        <h4>{ticket.title}</h4>
                        <span className={`status ${ticket.status}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p>{ticket.description}</p>
                      <small>{new Date(ticket.created_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="contact-section">
              <h2>Submit a Ticket</h2>

              {submitted && (
                <div className="success-message">
                  ✓ Ticket submitted successfully! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmitTicket}>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
