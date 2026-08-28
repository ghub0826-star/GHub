import React from 'react';
import { useNavigate } from 'react-router-dom';

// Single notification row in the dropdown / list.
export default function NotificationItem({ notification, onRead, onDelete }) {
  const navigate = useNavigate();
  const n = notification || {};
  const isRead = !!n.is_read || !!n.isRead;

  const handleClick = () => {
    if (!isRead && onRead) onRead(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        gap: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: isRead ? 'transparent' : 'rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: '0.9rem' }}>{n.title || 'Notifikasi'}</strong>
          {!isRead && (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          )}
        </div>
        {n.message && (
          <div className='muted' style={{ fontSize: '0.82rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {n.message}
          </div>
        )}
        {n.created_at && (
          <div className='muted' style={{ fontSize: '0.72rem', marginTop: 4 }}>
            {new Date(n.created_at).toLocaleString()}
          </div>
        )}
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
          style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem' }}
          aria-label='Hapus'
        >
          ✕
        </button>
      )}
    </div>
  );
}
