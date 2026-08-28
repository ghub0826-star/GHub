import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';

// Dropdown panel listing recent notifications with actions.
export default function NotificationDropdown({ onClose }) {
  const {
    notifications,
    markRead,
    markAllRead,
    remove,
    fetchNotifications,
    loading,
  } = useNotifications();

  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications({ limit: 20 });
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target) && onClose) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className='card'
      style={{
        position: 'absolute',
        right: 0,
        top: 44,
        width: 340,
        maxHeight: 420,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <strong>Notifikasi</strong>
        <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem' }}>
          Tandai semua dibaca
        </button>
      </div>

      <div style={{ overflow: 'auto', flex: 1 }}>
        {loading && notifications.length === 0 ? (
          <div className='muted' style={{ padding: 16, textAlign: 'center' }}>Memuat...</div>
        ) : notifications.length === 0 ? (
          <div className='muted' style={{ padding: 16, textAlign: 'center' }}>Tidak ada notifikasi.</div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markRead} onDelete={remove} />
          ))
        )}
      </div>

      <Link
        to='/notifications'
        onClick={onClose}
        style={{ display: 'block', textAlign: 'center', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.85rem' }}
      >
        Lihat semua
      </Link>
    </div>
  );
}
