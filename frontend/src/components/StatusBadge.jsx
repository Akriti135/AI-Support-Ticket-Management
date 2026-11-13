import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = status ? status.toLowerCase() : 'open';
  
  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  return (
    <span className={`badge badge-${normalized}`}>
      {labels[normalized] || status}
    </span>
  );
};
