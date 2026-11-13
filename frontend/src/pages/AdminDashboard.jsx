import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleUpdating, setRoleUpdating] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdating(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      // refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setRoleUpdating(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        Loading admin dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: '#ef4444' }}>{error}</h3>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          Administrator Control Center
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          System-wide telemetry, performance metrics, and staff role management.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            📊
          </div>
          <div className="stat-info">
            <h4>Total Tickets</h4>
            <div className="stat-value">{stats?.totalTickets || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            ⚡
          </div>
          <div className="stat-info">
            <h4>Open Queue</h4>
            <div className="stat-value">{stats?.openTickets || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
            🎯
          </div>
          <div className="stat-info">
            <h4>Resolved Tickets</h4>
            <div className="stat-value">{stats?.resolvedTickets || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            👥
          </div>
          <div className="stat-info">
            <h4>Registered Users</h4>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '26px' }}>
        {/* Category Breakdown */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Tickets by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.byCategory &&
              Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13.5px', color: '#334155' }}>{category}</span>
                  <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '13px' }}>
                    {count} tickets
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Tickets by Priority</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.byPriority &&
              Object.entries(stats.byPriority).map(([priority, count]) => (
                <div key={priority} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13.5px', color: '#334155' }}>{priority} Priority</span>
                  <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '13px' }}>
                    {count} tickets
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">User & Role Management</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Promote users to Support Agents or System Administrators
            </p>
          </div>
          <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', fontSize: '12px' }}>
            {users.length} Registered Accounts
          </span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Current Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '700', color: '#2563eb' }}>#{u.id}</td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{u.name}</td>
                  <td style={{ color: '#475569' }}>{u.email}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          u.role === 'ROLE_ADMIN'
                            ? '#f3e8ff'
                            : u.role === 'ROLE_AGENT'
                            ? '#e0f2fe'
                            : '#f1f5f9',
                        color:
                          u.role === 'ROLE_ADMIN'
                            ? '#7e22ce'
                            : u.role === 'ROLE_AGENT'
                            ? '#0369a1'
                            : '#475569',
                      }}
                    >
                      {u.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: '150px', padding: '5px 8px', fontSize: '12.5px' }}
                      value={u.role}
                      disabled={roleUpdating === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="ROLE_USER">User</option>
                      <option value="ROLE_AGENT">Agent</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
