import React from 'react';

// Small red badge showing an unread count.
export default function NotificationBadge({ count, className = '', style = {} }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`notification-badge ${className}`}
      style={{
        position: 'absolute',
        top: -4,
        right: -4,
        background: '#ff6b6b',
        color: '#000',
        fontWeight: 800,
        borderRadius: 12,
        padding: '1px 6px',
        fontSize: '0.7rem',
        minWidth: 18,
        textAlign: 'center',
        lineHeight: '1.4',
        ...style,
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
