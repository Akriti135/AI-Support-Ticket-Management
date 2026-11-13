import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff, isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // AI Summary State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetchTicketData();
    if (isStaff) {
      fetchAgents();
    }
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const [ticketRes, commentsRes, historyRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
        api.get(`/tickets/${id}/history`),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users/agents');
      setAgents(res.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/tickets/${id}/status`, { status: newStatus });
      setTicket(res.data);
      // refresh history
      const histRes = await api.get(`/tickets/${id}/history`);
      setHistory(histRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignAgent = async (agentId) => {
    if (!agentId) return;
    try {
      const res = await api.put(`/tickets/${id}/assign`, { agentId: Number(agentId) });
      setTicket(res.data);
      const histRes = await api.get(`/tickets/${id}/history`);
      setHistory(histRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign agent');
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/tickets/${id}`);
      navigate('/tickets');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tickets/${id}/comments`, { commentText: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
      // update history
      const histRes = await api.get(`/tickets/${id}/history`);
      setHistory(histRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.post(`/api/ai/summarize/${id}`);
      setAiData(res.data);
    } catch (err) {
      // Fallback endpoint if prefixed without /api
      try {
        const res2 = await api.post(`/ai/summarize/${id}`);
        setAiData(res2.data);
      } catch (e) {
        setAiError(e.response?.data?.message || 'AI summary service could not be reached.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        Loading ticket #{id}...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>Error Loading Ticket</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>{error || 'Ticket not found'}</p>
        <Link to="/tickets" className="btn btn-secondary">
          Back to Tickets
        </Link>
      </div>
    );
  }

  const canDelete = isAdmin || ticket.createdById === user?.id;

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/tickets" style={{ color: '#64748b', textDecoration: 'none', fontSize: '13.5px' }}>
            ← Back to Tickets
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: '#2563eb', fontWeight: '700' }}>Ticket #{ticket.id}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleGenerateAiSummary}
            className="btn btn-ai"
            disabled={aiLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {aiLoading ? 'AI Analyzing...' : 'AI Summary & Suggestion'}
          </button>

          {canDelete && (
            <button onClick={handleDeleteTicket} className="btn btn-danger" style={{ padding: '8px 12px' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* AI Summary Banner (if generated) */}
      {aiData && (
        <div className="ai-summary-box">
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ai-badge">🤖 AI Intelligence</span>
              <span style={{ fontSize: '12.5px', color: '#0369a1', fontWeight: '600' }}>
                {aiData.note}
              </span>
            </div>
            <button
              onClick={() => setAiData(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>Executive Summary:</strong>
            <p style={{ fontSize: '13.5px', color: '#1e293b', marginTop: '3px' }}>
              {aiData.summary}
            </p>
          </div>

          {aiData.suggestedAction && (
            <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
              <strong style={{ fontSize: '12.5px', color: '#0369a1' }}>Recommended Next Step:</strong>
              <p style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                💡 {aiData.suggestedAction}
              </p>
            </div>
          )}
        </div>
      )}

      {aiError && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '18px' }}>
          {aiError}
        </div>
      )}

      {/* Main Grid: Ticket Details + Sidebar Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Ticket Info & Comments & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Ticket Information Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="badge badge-category">{ticket.category}</span>
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              {ticket.title}
            </h1>

            <div style={{ fontSize: '14px', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {ticket.description}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '12.5px', color: '#64748b' }}>
              <div>Submitted by: <strong style={{ color: '#0f172a' }}>{ticket.createdByName}</strong></div>
              <div>•</div>
              <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '10px' }}>
              <h3 className="card-title">Comments & Discussions ({comments.length})</h3>
            </div>

            {comments.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13.5px', fontStyle: 'italic', padding: '10px 0' }}>
                No comments yet. Leave a response below.
              </p>
            ) : (
              <div>
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user?.name}</span>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10px' }}>
                          {comment.user?.role?.replace('ROLE_', '')}
                        </span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="comment-text">{comment.commentText}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} style={{ marginTop: '20px' }}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Write a comment or resolution note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingComment || !newComment.trim()}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {/* Ticket History / Audit Trail */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <h3 className="card-title">Activity Audit Trail ({history.length})</h3>
            </div>

            {history.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px' }}>No activity history recorded.</p>
            ) : (
              <div className="timeline">
                {history.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>
                          {h.action.replace('_', ' ')}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569' }}>
                        by <strong style={{ color: '#2563eb' }}>{h.changedBy?.name}</strong>: {h.newValue || 'Updated'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Assignment Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Quick Management Box */}
          <div className="card">
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
              Ticket Management
            </h4>

            {/* Quick Status Control */}
            <div className="form-group">
              <label className="form-label">Current Status</label>
              <select
                className="form-control"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Agent Assignment (For Staff) */}
            {isStaff && (
              <div className="form-group">
                <label className="form-label">Assigned Agent</label>
                <select
                  className="form-control"
                  value={ticket.assignedToId || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                >
                  <option value="">-- Assign to Agent --</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Assigned To:</span>
                <span style={{ fontWeight: '600', color: ticket.assignedToName ? '#0f172a' : '#94a3b8' }}>
                  {ticket.assignedToName || 'Unassigned'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Priority:</span>
                <span style={{ fontWeight: '600' }}>{ticket.priority}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748b' }}>Category:</span>
                <span style={{ fontWeight: '600' }}>{ticket.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
