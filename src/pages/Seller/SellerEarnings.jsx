import React, { useEffect, useState } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import * as sellerService from '../../services/sellerService';
import formatCurrency from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

const METRICS = [
  {
    key: 'today',
    label: 'Hari Ini',
    icon: 'fa-solid fa-calendar-day',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.1)',
  },
  {
    key: 'month',
    label: 'Bulan Ini',
    icon: 'fa-solid fa-calendar',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    key: 'total',
    label: 'Total Semua',
    icon: 'fa-solid fa-chart-line',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
  },
  {
    key: 'pending',
    label: 'Dalam Proses',
    icon: 'fa-solid fa-clock',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
];

export default function SellerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    let mounted = true;
    sellerService.getEarnings()
      .then(r => {
        if (!mounted) return;
        // Backend: { success: true, earnings: { today, month, total, pending } }
        const data = r?.data?.earnings || r?.data || { today: 0, month: 0, total: 0, pending: 0 };
        setEarnings(data);
      })
      .catch(() => {
        if (mounted) {
          setError('Gagal memuat data pendapatan.');
          setEarnings({ today: 0, month: 0, total: 0, pending: 0 });
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(52,211,153,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#34d399', fontSize: '1.1rem',
            }}>
              <i className="fa-solid fa-chart-line" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Pendapatan</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Ringkasan pendapatan toko Anda</p>
            </div>
          </div>
          <Link to="/seller/balance" className="button small cta-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-wallet" />
            <span>Lihat Saldo & Tarik Dana</span>
          </Link>
        </div>

        {error && (
          <div className="error" style={{ padding: '12px 16px', borderRadius: 10 }}>{error}</div>
        )}

        {/* Metric cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: 20, height: 96,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {METRICS.map(m => (
              <div key={m.key} style={{
                background: 'var(--surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: m.bg, color: m.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem',
                  }}>
                    <i className={m.icon} />
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>{m.label}</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {formatCurrency(earnings?.[m.key] || 0)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info card */}
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 14, padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <i className="fa-solid fa-circle-info" style={{ color: '#818cf8', fontSize: '1.1rem', marginTop: 2 }} />
          <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Dalam Proses</strong> adalah pendapatan dari pesanan yang sedang berjalan (dibayar/diproses)
            dan belum diselesaikan buyer. Dana akan masuk ke saldo setelah pesanan selesai.
          </div>
        </div>

      </div>
    </SellerLayout>
  );
}
