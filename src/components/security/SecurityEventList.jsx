import React from 'react';

const SEVERITY_COLORS = {
  LOW: 'rgba(0,200,160,0.5)',
  MEDIUM: 'rgba(255,200,0,0.5)',
  HIGH: 'rgba(255,120,0,0.5)',
  CRITICAL: 'rgba(255,60,60,0.5)',
};

export default function SecurityEventList({ events }) {
  if (!events || events.length === 0) {
    return <p className='muted'>Belum ada aktivitas keamanan.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {events.map((ev) => (
        <div key={ev.id} className='card' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: 10, background: SEVERITY_COLORS[ev.severity] || 'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontWeight: 700 }}>{ev.event_type}</div>
              <div className='muted' style={{ fontSize: 13 }}>{ev.description}</div>
            </div>
          </div>
          <div className='muted' style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {ev.created_at ? new Date(ev.created_at).toLocaleString('id-ID') : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
