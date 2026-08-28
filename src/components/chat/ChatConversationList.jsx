import React from 'react';

// List of conversations (sidebar).
export default function ChatConversationList({ conversations, activeId, onSelect, loading }) {
  if (loading) return <div className='muted' style={{ padding: 16 }}>Memuat...</div>;
  if (!conversations || conversations.length === 0) {
    return <div className='muted' style={{ padding: 16 }}>Belum ada percakapan.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {conversations.map((c) => {
        const title = c.order_number || `Konser #${c.id}`;
        const active = activeId === c.id;
        return (
          <div
            key={c.id}
            onClick={() => onSelect && onSelect(c)}
            className='card'
            style={{
              cursor: 'pointer',
              padding: 10,
              border: active ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{title}</strong>
              <small className='muted'>{c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ''}</small>
            </div>
            <div className='muted' style={{ fontSize: '0.8rem', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.order_number ? `Order #${c.order_number}` : 'Percakapan'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
