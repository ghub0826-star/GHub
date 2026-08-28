import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as chatService from '../../services/chatService';
import { Link } from 'react-router-dom';

/**
 * General Conversations page — /chat
 * Lists all conversations for the current user and shows messages for selected conversation.
 */
export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]           = useState(null); // selected conversation
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState('');
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [error, setError]                 = useState('');
  const bottomRef                         = useRef(null);

  // Load conversation list
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    chatService.listConversations()
      .then(r => { if (mounted) setConversations(r.conversations || []); })
      .catch(() => { if (mounted) setError('Gagal memuat daftar percakapan.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selected) return;
    let mounted = true;
    chatService.getMessages(selected.id)
      .then(r => { if (mounted) setMessages(r.messages || []); })
      .catch(() => { if (mounted) setMessages([]); });
    return () => { mounted = false; };
  }, [selected?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !selected || sending) return;
    setSending(true);
    try {
      const r = await chatService.sendMessage(selected.id, { message: text.trim() });
      setMessages(prev => [...prev, r.message]);
      setText('');
      // Mark as read
      chatService.markConversationRead(selected.id).catch(() => {});
    } catch {
      setError('Gagal mengirim pesan. Coba lagi.');
    } finally {
      setSending(false);
    }
  }, [text, selected, sending]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) {
    return (
      <div className='container'>
        <div className='card' style={{ padding: 32, textAlign: 'center' }}>Memuat percakapan...</div>
      </div>
    );
  }

  return (
    <div className='container' style={{ display: 'flex', gap: 16, height: '70vh', minHeight: 400 }}>
      {/* Left: conversation list */}
      <div className='card' style={{ width: 280, flexShrink: 0, overflow: 'auto', padding: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700 }}>
          Percakapan
        </div>
        {conversations.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
            Belum ada percakapan.<br />
            <Link to='/buyer/orders' style={{ color: 'var(--primary)', marginTop: 8, display: 'block' }}>
              Lihat Pesanan →
            </Link>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => { setSelected(conv); setError(''); }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: selected?.id === conv.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {conv.order_number || `Percakapan #${conv.id}`}
              </div>
              <div className='muted' style={{ fontSize: 12, marginTop: 2 }}>
                {conv.last_message || 'Belum ada pesan'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: message panel */}
      <div className='card' style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            Pilih percakapan untuk mulai chat
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700 }}>
              {selected.order_number || `Percakapan #${selected.id}`}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {error && <div className='error' style={{ marginBottom: 8 }}>{error}</div>}
              {messages.length === 0 ? (
                <div className='muted' style={{ textAlign: 'center', marginTop: 32 }}>Belum ada pesan</div>
              ) : messages.map(msg => {
                const isMine = Number(msg.sender_id) === Number(user?.id);
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMine ? 'var(--primary, #6366f1)' : 'rgba(255,255,255,0.07)',
                      color: isMine ? '#fff' : 'inherit',
                      fontSize: 14,
                    }}>
                      {!isMine && <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>{msg.sender_name}</div>}
                      <div>{msg.message}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Tulis pesan... (Enter untuk kirim)'
                style={{ flex: 1 }}
                disabled={sending}
              />
              <button className='button' onClick={handleSend} disabled={sending || !text.trim()}>
                {sending ? '...' : 'Kirim'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
