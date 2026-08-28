import React from 'react';

// Renders a single chat message bubble (text / image / file).
export default function ChatMessageBubble({ message, isOwn }) {
  const m = message || {};
  const type = m.message_type || 'TEXT';
  const text = m.message || '';

  const bubbleStyle = {
    alignSelf: isOwn ? 'flex-end' : 'flex-start',
    background: isOwn ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
    color: isOwn ? '#000' : 'inherit',
    padding: '8px 12px',
    borderRadius: 12,
    maxWidth: '70%',
    wordBreak: 'break-word',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
      <div style={bubbleStyle}>
        {type === 'IMAGE' && m.attachment && (
          <img src={m.attachment} alt='attachment' style={{ maxWidth: 220, borderRadius: 8, display: 'block' }} />
        )}
        {type === 'FILE' && m.attachment && (
          <a href={m.attachment} target='_blank' rel='noreferrer' style={{ color: 'inherit' }}>📎 {text || 'File'}</a>
        )}
        {type === 'SYSTEM' ? (
          <em style={{ opacity: 0.7, fontSize: '0.8rem' }}>{text}</em>
        ) : (
          text && <span>{text}</span>
        )}
      </div>
      {m.created_at && (
        <small className='muted' style={{ fontSize: '0.7rem', marginTop: 2, textAlign: isOwn ? 'right' : 'left' }}>
          {new Date(m.created_at).toLocaleString()}
        </small>
      )}
    </div>
  );
}
