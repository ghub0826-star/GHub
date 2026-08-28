import React, { useState } from 'react';

// Chat input with send + typing indicator + optional file upload.
export default function ChatInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
    if (onTyping) {
      onTyping(true);
      clearTimeout(window.__typingTimer);
      window.__typingTimer = setTimeout(() => onTyping(false), 1500);
    }
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    if (onTyping) onTyping(false);
  };

  return (
    <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={2}
        placeholder='Tulis pesan...'
        disabled={disabled}
        style={{ flex: 1, resize: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, color: 'inherit' }}
      />
      <button className='button' onClick={handleSend} disabled={disabled}>Kirim</button>
    </div>
  );
}
