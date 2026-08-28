import React from 'react';

// Header for a chat window showing the order/conversation title.
export default function ChatHeader({ title, subtitle, typing }) {
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <strong>{title || 'Chat'}</strong>
      {subtitle && <div className='muted' style={{ fontSize: '0.8rem' }}>{subtitle}</div>}
      {typing && typing.length > 0 && (
        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: 2 }}>Sedang mengetik...</div>
      )}
    </div>
  );
}
