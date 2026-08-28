import React from 'react';

export default function DeviceCard({ session, onRevoke, current }) {
  return (
    <div className='card' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={session.device_type === 'mobile' ? 'fa-solid fa-mobile-screen-button' : 'fa-solid fa-laptop'} />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>
            {session.device_name || 'Perangkat'}
            {current && <span style={{ color: 'var(--accent)', fontSize: 12, marginLeft: 8 }}>• Perangkat ini</span>}
          </div>
          <div className='muted' style={{ fontSize: 13 }}>
            {session.browser || 'Browser'} • {session.operating_system || 'OS'}
          </div>
          <div className='muted' style={{ fontSize: 12 }}>
            IP: {session.ip_address || 'Unknown'} 
            {session.last_activity_at ? ` • Aktif: ${new Date(session.last_activity_at).toLocaleString('id-ID')}` : ''}
          </div>
        </div>
      </div>
      {!current && (
        <button className='button small cta-outline' onClick={() => onRevoke(session.id)}>Akhiri</button>
      )}
    </div>
  );
}
