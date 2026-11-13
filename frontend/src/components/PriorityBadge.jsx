import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const normalized = priority ? priority.toLowerCase() : 'medium';

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };

  return (
    <span className={`badge badge-${normalized}`}>
      {labels[normalized] || priority}
    </span>
  );
};
