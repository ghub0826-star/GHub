import React, { useState } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';

// Notifikasi real tidak memiliki demo data — dimulai kosong untuk akun baru
// Notifikasi akan terisi otomatis dari backend ketika ada aktivitas pada akun

export default function BuyerNotifications() {
  // Starts empty — real notifications will come from backend events
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
  };

  const markRead = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: false } : i)));
  };

  const deleteNotification = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => {
    if (filter === 'unread') return i.unread;
    if (filter !== 'all') return i.type === filter;
    return true;
  });

  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <BuyerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(167,139,250,0.12)',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src='/assets/notifikasi.png'
                  alt=''
                  style={{ width: '75%', height: '75%', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Notifikasi</h1>
            </div>
            <p style={{ color: '#94a3b8', margin: '6px 0 0 48px', fontSize: '0.88rem' }}>
              Pemberitahuan penting tentang status pesanan, chat, keamanan, dan promo spesial.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type='button'
              className='button small'
              onClick={markAllRead}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <i className='fa-solid fa-check-double' />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Filter Pills with Icons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Semua', icon: 'fa-solid fa-border-all' },
            { key: 'unread', label: `Belum Dibaca${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: 'fa-solid fa-circle-dot' },
            { key: 'order', label: 'Pesanan', icon: 'fa-solid fa-box' },
            { key: 'chat', label: 'Pesan', icon: 'fa-solid fa-comment' },
            { key: 'security', label: 'Keamanan', icon: 'fa-solid fa-shield-halved' },
            { key: 'promo', label: 'Promo', icon: 'fa-solid fa-tags' },
          ].map((f) => (
            <button
              key={f.key}
              type='button'
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontWeight: filter === f.key ? 700 : 500,
                background: filter === f.key ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                color: filter === f.key ? '#818cf8' : '#94a3b8',
                border: filter === f.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className={f.icon} style={{ fontSize: '0.75rem' }} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {filtered.length === 0 ? (
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
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '1.8rem', color: '#818cf8' }}>
              <i className='fa-regular fa-bell' />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.15rem' }}>Tidak ada notifikasi</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 auto', maxWidth: 380 }}>
              {filter === 'all'
                ? 'Notifikasi akan muncul di sini saat ada aktivitas pada akun, pesanan, atau promo.'
                : 'Tidak ada notifikasi yang sesuai dengan filter yang dipilih.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                className='card'
                style={{
                  background: n.unread ? 'rgba(99,102,241,0.08)' : 'var(--surface)',
                  border: n.unread ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 14,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `rgba(255,255,255,0.05)`,
                      color: n.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className={n.icon} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{n.title}</span>
                      {n.unread && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: '#6366f1',
                            color: '#fff',
                          }}
                        >
                          Baru
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.45 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>{n.time}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {n.unread && (
                    <button
                      type='button'
                      className='button small'
                      onClick={() => markRead(n.id)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title='Tandai sudah dibaca'
                    >
                      <i className='fa-solid fa-check' />
                    </button>
                  )}
                  <button
                    type='button'
                    className='button small outline'
                    onClick={() => deleteNotification(n.id)}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'transparent' }}
                    title='Hapus notifikasi'
                  >
                    <i className='fa-regular fa-trash-can' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
