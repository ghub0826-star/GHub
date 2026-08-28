import React, { useEffect, useState, useCallback } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import * as orderService from '../../services/orderService';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const STATUS_TABS = [
  { key: '', label: 'Semua' },
  { key: 'PAID', label: 'Dibayar' },
  { key: 'PROCESSING', label: 'Diproses' },
  { key: 'SHIPPED', label: 'Dikirim' },
  { key: 'DELIVERED', label: 'Diterima' },
  { key: 'COMPLETED', label: 'Selesai' },
  { key: 'DISPUTED', label: 'Dispute' },
  { key: 'CANCELLED', label: 'Dibatalkan' },
];

const STATUS_STYLE = {
  PAID:        { label: 'Dibayar',    color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  PROCESSING:  { label: 'Diproses',   color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  SHIPPED:     { label: 'Dikirim',    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  DELIVERED:   { label: 'Diterima',   color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  COMPLETED:   { label: 'Selesai',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  CANCELLED:   { label: 'Dibatalkan', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  REFUNDED:    { label: 'Direfund',   color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  DISPUTED:    { label: 'Dispute',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  PENDING:     { label: 'Pending',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status?.toUpperCase()] || { label: status || '—', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

export default function SellerOrders() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [tab,       setTab]       = useState('');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    orderService.getSellerOrders()
      .then(res => {
        if (!mounted) return;
        const list = Array.isArray(res?.orders)      ? res.orders
                   : Array.isArray(res?.data?.orders) ? res.data.orders
                   : Array.isArray(res?.data)          ? res.data
                   : [];
        setAllOrders(list);
      })
      .catch(() => { if (mounted) setError('Gagal memuat pesanan. Coba refresh halaman.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = allOrders.filter(o => {
    const status = (o.order_status || '').toUpperCase();
    const matchTab = !tab || status === tab;
    const q = search.toLowerCase().trim();
    const matchSearch = !q
      || (o.sub_order_number || '').toLowerCase().includes(q)
      || (o.order_number     || '').toLowerCase().includes(q)
      || (o.buyer_username   || '').toLowerCase().includes(q)
      || (o.items || []).some(i => (i.product_name || i.product_title || '').toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  // Tab counts
  const tabCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === ''
      ? allOrders.length
      : allOrders.filter(o => (o.order_status || '').toUpperCase() === t.key).length;
    return acc;
  }, {});

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(56,189,248,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#38bdf8', fontSize: '1.1rem',
            }}>
              <i className="fa-solid fa-receipt" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Pesanan Masuk</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                {loading ? 'Memuat...' : `${allOrders.length} total pesanan`}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error" style={{ padding: '12px 16px', borderRadius: 10 }}>{error}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
                background: tab === t.key ? 'var(--primary, #6366f1)' : 'rgba(255,255,255,0.05)',
                color: tab === t.key ? '#fff' : '#94a3b8',
              }}
            >
              {t.label}
              {tabCounts[t.key] > 0 && (
                <span style={{
                  marginLeft: 6, padding: '1px 7px', borderRadius: 10,
                  background: tab === t.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                  fontSize: '0.75rem',
                }}>
                  {tabCounts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <i className="fa-solid fa-search" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#64748b', fontSize: '0.88rem', pointerEvents: 'none',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nomor pesanan, username buyer, atau nama produk..."
            style={{ width: '100%', paddingLeft: 36 }}
          />
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--surface)', borderRadius: 14, height: 88,
                border: '1px solid rgba(255,255,255,0.06)',
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            background: 'var(--surface)', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '2rem', color: '#334155', display: 'block', marginBottom: 12 }} />
            <div style={{ color: '#fff', fontWeight: 600 }}>Tidak ada pesanan</div>
            <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>
              {search || tab ? 'Coba ubah filter atau kata kunci pencarian' : 'Belum ada pesanan yang masuk ke toko Anda'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(o => {
              const orderNum  = o.sub_order_number || o.order_number;
              const masterNum = o.order_number;
              const items     = o.items || [];
              const firstItem = items[0];

              return (
                <div
                  key={o.id || orderNum}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, padding: '16px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: 16, flexWrap: 'wrap',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Left */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 260px', minWidth: 0 }}>
                    {/* Product thumbnail */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {firstItem?.product_image ? (
                        <img src={firstItem.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fa-solid fa-box" style={{ color: '#818cf8', fontSize: '1.2rem' }} />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        #{orderNum}
                      </div>
                      {firstItem && (
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {firstItem.product_name || firstItem.product_title}
                          {items.length > 1 && <span style={{ color: '#64748b' }}> +{items.length - 1} lainnya</span>}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 5, flexWrap: 'wrap' }}>
                        <StatusBadge status={o.order_status} />
                        {o.buyer_username && (
                          <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                            <i className="fa-solid fa-user" style={{ marginRight: 4 }} />
                            {o.buyer_username}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                      {formatCurrency(o.total_amount)}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        to={`/seller/orders/${orderNum}`}
                        className="button small"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: '0.82rem' }}
                      >
                        <i className="fa-solid fa-eye" />
                        <span>Detail</span>
                      </Link>
                      <Link
                        to={`/seller/orders/${masterNum || orderNum}/chat`}
                        className="button small cta-outline"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: '0.82rem' }}
                        title="Chat dengan buyer"
                      >
                        <i className="fa-solid fa-comments" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
