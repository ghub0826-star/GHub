import React, { useState } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';

// Bell icon with unread badge and dropdown. Renders only when authenticated.
export default function NotificationBell() {
  const { unreadCount } = useSocketContext();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label='Notifikasi'
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '1.15rem',
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <i className='fa-solid fa-bell' />
        <NotificationBadge count={unreadCount} />
      </button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
