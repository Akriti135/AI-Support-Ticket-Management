import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const Dashboard = () => {
  const { user, isStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      const ticketList = res.data;
      setTickets(ticketList);

      const total = ticketList.length;
      const open = ticketList.filter((t) => t.status === 'OPEN').length;
      const inProgress = ticketList.filter((t) => t.status === 'IN_PROGRESS').length;
      const resolved = ticketList.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

      setStats({ total, open, inProgress, resolved });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const recentTickets = tickets.slice(0, 6);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
            Hello, {user?.name} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isStaff
              ? 'Here is an overview of active support requests across the system.'
              : 'Track the status and responses for all your support tickets.'}
          </p>
        </div>
        <Link to="/create-ticket" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Ticket
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            📁
          </div>
          <div className="stat-info">
            <h4>Total Tickets</h4>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            ⏳
          </div>
          <div className="stat-info">
            <h4>Open</h4>
            <div className="stat-value">{stats.open}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            ⚙️
          </div>
          <div className="stat-info">
            <h4>In Progress</h4>
            <div className="stat-value">{stats.inProgress}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
            ✅
          </div>
          <div className="stat-info">
            <h4>Resolved</h4>
            <div className="stat-value">{stats.resolved}</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Tickets</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Latest support requests needing review or action
            </p>
          </div>
          <Link to="/tickets" className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
            View All ({tickets.length})
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading tickets...</div>
        ) : recentTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>No tickets submitted yet.</p>
            <Link to="/create-ticket" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Create your first ticket
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Assigned Agent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '600' }}
                      >
                        <span style={{ color: '#2563eb', marginRight: '6px' }}>#{ticket.id}</span>
                        {ticket.title}
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-category">{ticket.category}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>
                      {ticket.createdByName || 'User'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>
                      {ticket.assignedToName ? (
                        <span style={{ color: '#0369a1', fontWeight: '600' }}>{ticket.assignedToName}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
