import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// AIChatWidget — floating AI chat assistant. Opens a window for chatting with
// the GHub AI assistant, supports message list and feedback submission.
// ============================================================================

export default function AIChatWidget() {
  const { isAuthenticated } = useAuth();
  const { chat, feedback, loading, error } = useAI();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lastRequestId, setLastRequestId] = useState(null);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    const res = await chat(text);
    if (res && res.reply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.requestId) setLastRequestId(res.requestId);
    } else if (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${error}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className='ai-widget-launcher'
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg,#7c5cfc,#b06cff)', color: '#fff',
          fontSize: 24, cursor: 'pointer', boxShadow: '0 6px 20px rgba(124,92,252,.4)',
        }}
        aria-label='Chat AI'
      >
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div
          className='ai-widget-window card'
          style={{
            position: 'fixed', bottom: 92, right: 24, zIndex: 999,
            width: 340, maxHeight: 460, display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', fontWeight: 700 }}>
            🤖 Asisten AI GHub
          </div>
          <div className='ai-widget-messages' style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                Halo! Tanyakan apa saja tentang produk, transaksi, atau bantuan GHub.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'var(--accent,#7c5cfc)' : 'rgba(255,255,255,.07)',
                  color: '#fff', padding: '8px 12px', borderRadius: 12, maxWidth: '86%', fontSize: 14, whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Mengetik...</div>}
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Tulis pesan...'
              style={{ flex: 1, background: 'rgba(255,255,255,.06)', color: '#fff', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '8px 10px' }}
            />
            <button className='button small' onClick={handleSend} disabled={loading}>Kirim</button>
          </div>
          {lastRequestId && (
            <button
              onClick={() => {
                feedback({ requestId: lastRequestId, rating: 5 });
              }}
              style={{ border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: 12, padding: 4, cursor: 'pointer' }}
            >
              👍 Balasan membantu
            </button>
          )}
        </div>
      )}
    </>
  );
}
