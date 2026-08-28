import React, { useEffect, useState } from 'react';
import NotificationItem from '../components/notification/NotificationItem';
import { useNotifications } from '../hooks/useNotifications';

export default function Notifications(){
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications({ limit: 50, filter });
  }, [fetchNotifications, filter]);

  return (
    <div className='container'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Notifikasi</h1>
        <button className='button small' onClick={markAllRead}>Tandai semua dibaca</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'button small' : 'button small outline'}
            style={{ background: filter === f ? 'var(--accent)' : 'transparent', color: filter === f ? '#000' : 'inherit', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {f === 'all' ? 'Semua' : 'Belum dibaca'}
          </button>
        ))}
      </div>

      <div className='card'>
        {loading && notifications.length === 0 ? (
          <div className='muted' style={{ padding: 24, textAlign: 'center' }}>Memuat...</div>
        ) : error && notifications.length === 0 ? (
          <div className='muted' style={{ padding: 24, textAlign: 'center' }}>{error}</div>
        ) : notifications.length === 0 ? (
          <div className='muted' style={{ padding: 24, textAlign: 'center' }}>Tidak ada notifikasi.</div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markRead} onDelete={remove} />
          ))
        )}
      </div>
    </div>
  );
}
