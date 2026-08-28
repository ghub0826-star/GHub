import React from 'react';

export default function BuyerStats({ stats }) {
  const cards = [
    {
      title: 'Total Pesanan',
      value: stats?.total ?? 0,
      sub: `+${stats?.newThisMonth ?? 0} bulan ini`,
      icon: 'fa-solid fa-box-archive',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'Pesanan Aktif',
      value: stats?.active ?? 0,
      sub: 'Sedang diproses',
      icon: 'fa-solid fa-clock-rotate-left',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
    },
    {
      title: 'Menunggu Bayar',
      value: stats?.pending ?? 0,
      sub: 'Selesaikan transaksi',
      icon: 'fa-regular fa-credit-card',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Pesanan Selesai',
      value: stats?.completed ?? 0,
      sub: 'Transaksi berhasil',
      icon: 'fa-regular fa-circle-check',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
      {cards.map((c, idx) => (
        <div
          key={idx}
          className='card stat-card'
          style={{
            background: 'var(--surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{c.title}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>{c.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>{c.sub}</div>
            </div>

            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: c.bg,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
              }}
            >
              <i className={c.icon} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
