import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Portal</span>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
          AI Support & Ticket Management
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link to="/create-ticket" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Ticket
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
