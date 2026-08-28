import React, { useState, useRef, useEffect } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'ghub_buyer_conversations';

export default function BuyerMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [loaded, setLoaded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  const activeConv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const send = () => {
    if (!input.trim() || !activeId) return;
    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const next = conversations.map((c) =>
      c.id === activeId
        ? {
            ...c,
            last: newMsg.text,
            time: 'Baru saja',
            messages: [...(c.messages || []), newMsg],
          }
        : c
    );

    setConversations(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setInput('');
  };

  return (
    <BuyerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(56,189,248,0.12)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src='/assets/pesan & chat.png'
                alt=''
                style={{ width: '75%', height: '75%', objectFit: 'contain' }}
              />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Pesan & Chat Penjual</h1>
          </div>
          <p style={{ color: '#94a3b8', margin: '6px 0 0 48px', fontSize: '0.88rem' }}>
            Komunikasi langsung dengan seller untuk informasi pesanan dan konfirmasi pengiriman produk.
          </p>
        </div>

        {!loaded ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.6rem', color: '#6366f1', display: 'block', marginBottom: 10 }} />
            <div style={{ color: '#64748b' }}>Memuat pesan...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div
            className='card'
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '56px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(56,189,248,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                fontSize: '2rem',
                color: '#38bdf8',
              }}
            >
              <i className='fa-regular fa-comments' />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.2rem' }}>Belum ada obrolan</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 24px' }}>
              Saat Anda melakukan pesanan atau menghubungi penjual di marketplace, riwayat percakapan akan muncul di sini.
            </p>
            <Link
              to='/buyer/orders'
              className='button primary'
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <i className='fa-solid fa-box' />
              <span>Lihat Pesanan Saya</span>
            </Link>
          </div>
        ) : (
          <div
            className='card'
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 320px) 1fr',
              minHeight: 520,
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {/* Conversation List Sidebar */}
            <div
              style={{
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Daftar Percakapan</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{conversations.length} obrolan aktif</div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {conversations.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        transition: 'background 0.15s ease',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                          }}
                        >
                          {c.avatar || c.seller?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        {c.online && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: '#10b981',
                              border: '2px solid #0f172a',
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong
                            style={{
                              fontSize: '0.9rem',
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {c.seller}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.time}</span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: 2,
                          }}
                        >
                          {c.last}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Chat Conversation View */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {activeConv ? (
                <>
                  {/* Header of Chat */}
                  <div
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: '#6366f1',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {activeConv.avatar || activeConv.seller?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{activeConv.seller}</div>
                        <div style={{ fontSize: '0.78rem', color: activeConv.online ? '#10b981' : '#64748b' }}>
                          {activeConv.online ? '● Online' : '○ Offline'} {activeConv.orderNumber ? `• Order: ${activeConv.orderNumber}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      maxHeight: 380,
                    }}
                  >
                    {(activeConv.messages || []).map((m) => {
                      const isMe = m.from === 'me';
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '75%',
                              padding: '10px 14px',
                              borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              background: isMe ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.06)',
                              color: '#fff',
                              fontSize: '0.9rem',
                              lineHeight: 1.45,
                              boxShadow: isMe ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                            }}
                          >
                            {m.text}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{m.time}</span>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Box */}
                  <div
                    style={{
                      padding: '14px 20px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type='text'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder='Tulis pesan ke penjual... (tekan Enter untuk kirim)'
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                    <button
                      type='button'
                      className='button primary'
                      onClick={send}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>Kirim</span>
                      <i className='fa-solid fa-paper-plane' />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                  Pilih percakapan dari daftar di sebelah kiri
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
