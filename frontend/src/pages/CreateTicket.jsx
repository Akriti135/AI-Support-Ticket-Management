import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters to provide sufficient context');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tickets', {
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
      });
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please check your input.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          Create New Support Ticket
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Describe your issue in detail so our support staff and AI assistants can resolve it promptly.
        </p>
      </div>

      <div className="card">
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '13.5px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ticket Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SSL certificate expired on checkout subdomain"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="TECHNICAL">Technical (Bugs, infrastructure, code)</option>
                <option value="BILLING">Billing (Invoices, refunds, subscriptions)</option>
                <option value="GENERAL">General (Account, questions, other)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="LOW">Low (Minor cosmetic or informational)</option>
                <option value="MEDIUM">Medium (Normal business impact)</option>
                <option value="HIGH">High (Urgent, blocking work or revenue)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-control"
              rows={6}
              placeholder="Provide steps to reproduce, error messages, environment details, or any relevant transaction IDs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Link to="/tickets" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting Ticket...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
