import React, { useEffect, useState } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import * as orderService from '../../services/orderService';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Semua', icon: 'fa-solid fa-border-all' },
  { key: 'PENDING_PAYMENT', label: 'Menunggu Bayar', icon: 'fa-solid fa-clock' },
  { key: 'PAID', label: 'Dibayar', icon: 'fa-solid fa-credit-card' },
  { key: 'PROCESSING', label: 'Diproses', icon: 'fa-solid fa-gear' },
  { key: 'DELIVERED', label: 'Terkirim', icon: 'fa-solid fa-truck' },
  { key: 'COMPLETED', label: 'Selesai', icon: 'fa-solid fa-circle-check' },
  { key: 'CANCELLED', label: 'Dibatalkan', icon: 'fa-solid fa-ban' },
  { key: 'DISPUTED', label: 'Dispute', icon: 'fa-solid fa-triangle-exclamation' },
];

function getStatusBadge(status) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Selesai', bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
    case 'DELIVERED':
      return { label: 'Terkirim', bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' };
    case 'PROCESSING':
      return { label: 'Diproses Seller', bg: 'rgba(99,102,241,0.15)', color: '#818cf8' };
    case 'PAID':
      return { label: 'Sudah Dibayar', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' };
    case 'PENDING_PAYMENT':
      return { label: 'Menunggu Pembayaran', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    case 'CANCELLED':
      return { label: 'Dibatalkan', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
    case 'DISPUTED':
      return { label: 'Sengketa (Dispute)', bg: 'rgba(217,70,239,0.15)', color: '#d946ef' };
    default:
      return { label: status || 'Pending', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
  }
}

export default function BuyerOrders() {
  const [tab, setTab] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    orderService
      .getBuyerOrders()
      .then((res) => {
        if (!mounted) return;
        // Real orders only — no fallback to mock/demo data
        const list = res?.orders || res?.data || [];
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!mounted) return;
        setOrders([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const filtered = orders.filter((o) => {
    const matchesTab =
      tab === 'ALL' || o.order_status === tab || o.payment_status === tab;

    const query = activeSearch.toLowerCase();
    const matchesSearch =
      !query ||
      String(o.order_number || '').toLowerCase().includes(query) ||
      String(o.product_name || '').toLowerCase().includes(query) ||
      String(o.seller_name || '').toLowerCase().includes(query) ||
      String(o.game_name || '').toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  return (
    <BuyerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(99,102,241,0.12)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src='/assets/semua pesanan.png'
                  alt=''
                  style={{ width: '75%', height: '75%', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Pesanan Saya</h1>
            </div>
            <p style={{ color: '#94a3b8', margin: '6px 0 0 48px', fontSize: '0.88rem' }}>
              Pantau seluruh riwayat transaksi, pengiriman, dan status pembayaran Anda.
            </p>
          </div>

          <Link
            to='/marketplace'
            className='button primary small'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 9,
              fontSize: '0.88rem',
            }}
          >
            <i className='fa-solid fa-plus' />
            <span>Order Baru</span>
          </Link>
        </div>

        {/* ── Filter & Interactive Search Form ── */}
        <div
          className='card'
          style={{
            background: 'var(--surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Search Form with Dedicated Submit Button & Enter Support */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, width: '100%', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i
                className='fa-solid fa-magnifying-glass'
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              />
              <input
                type='text'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Ketik nomor pesanan (#ORD...), nama produk, atau seller...'
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: searchInput ? 36 : 14,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
              {searchInput && (
                <button
                  type='button'
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title='Hapus pencarian'
                >
                  <i className='fa-solid fa-xmark' />
                </button>
              )}
            </div>

            <button
              type='submit'
              className='button primary'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: '0.88rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              <i className='fa-solid fa-magnifying-glass' />
              <span>Cari</span>
            </button>

            {activeSearch && (
              <button
                type='button'
                onClick={handleClearSearch}
                className='button'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                  flexShrink: 0,
                }}
              >
                <i className='fa-solid fa-rotate-left' />
                <span>Reset</span>
              </button>
            )}
          </form>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.key}
                type='button'
                onClick={() => setTab(s.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: tab === s.key ? 700 : 500,
                  background: tab === s.key ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                  color: tab === s.key ? '#818cf8' : '#94a3b8',
                  border: tab === s.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <i className={s.icon} style={{ fontSize: '0.75rem' }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders List / Empty State ── */}
        {loading ? (
          <div className='card' style={{ padding: 48, textAlign: 'center', background: 'var(--surface)', borderRadius: 14 }}>
            <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.8rem', color: '#6366f1', marginBottom: 12, display: 'block' }} />
            <div style={{ color: '#94a3b8' }}>Memuat data pesanan...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className='card'
            style={{
              padding: '56px 24px',
              textAlign: 'center',
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                fontSize: '2rem',
                color: '#6366f1',
              }}
            >
              <i className='fa-solid fa-box-open' />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.15rem' }}>
              {activeSearch || tab !== 'ALL' ? 'Tidak ada pesanan yang sesuai' : 'Belum ada pesanan'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 400, margin: '0 auto 24px' }}>
              {activeSearch || tab !== 'ALL'
                ? `Tidak ada pesanan yang cocok dengan pencarian "${activeSearch || tab}". Coba gunakan nomor pesanan lain atau reset filter.`
                : 'Anda belum memiliki riwayat pesanan. Mulai belanja produk game favorit Anda di marketplace!'}
            </p>
            {activeSearch || tab !== 'ALL' ? (
              <button
                type='button'
                onClick={() => { setTab('ALL'); handleClearSearch(); }}
                className='button primary'
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <i className='fa-solid fa-rotate-left' />
                <span>Reset Filter & Pencarian</span>
              </button>
            ) : (
              <Link
                to='/marketplace'
                className='button primary'
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <i className='fa-solid fa-store' />
                <span>Jelajahi Marketplace</span>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Result count */}
            <div style={{ fontSize: '0.82rem', color: '#64748b', paddingLeft: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <i className='fa-solid fa-list-ul' style={{ marginRight: 6 }} />
                Menampilkan <strong style={{ color: '#94a3b8' }}>{filtered.length}</strong> pesanan
                {activeSearch && <span> untuk kata kunci: <strong style={{ color: '#818cf8' }}>"{activeSearch}"</strong></span>}
              </div>
            </div>

            {filtered.map((o) => {
              const badge = getStatusBadge(o.order_status);
              return (
                <div
                  key={o.order_number || o.id}
                  className='card'
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: '1 1 300px' }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: 'rgba(99,102,241,0.1)',
                        color: '#818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      <i className='fa-solid fa-bag-shopping' />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                          #{o.order_number}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.92rem', marginTop: 5 }}>
                        {o.product_name || 'Item Digital Marketplace'}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {o.seller_name && (
                          <span>
                            <i className='fa-solid fa-shop' style={{ marginRight: 4 }} />
                            <strong style={{ color: '#94a3b8' }}>{o.seller_name}</strong>
                          </span>
                        )}
                        {o.game_name && (
                          <span>
                            <i className='fa-solid fa-gamepad' style={{ marginRight: 4 }} />
                            {o.game_name}
                          </span>
                        )}
                        <span>
                          <i className='fa-regular fa-calendar' style={{ marginRight: 4 }} />
                          {o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : 'Baru saja'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Total Pembayaran</div>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                        {formatCurrency(o.total_amount || 0)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link
                        to={`/buyer/orders/${o.order_number}`}
                        className='button small'
                        style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        <i className='fa-solid fa-eye' />
                        <span>Detail</span>
                      </Link>

                      {o.order_status === 'PENDING_PAYMENT' && (
                        <Link
                          to={`/checkout/payment/${o.order_number}`}
                          className='button small primary'
                          style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <i className='fa-solid fa-credit-card' />
                          <span>Bayar</span>
                        </Link>
                      )}

                      <Link
                        to={`/buyer/orders/${o.order_number}/chat`}
                        className='button small'
                        style={{ padding: '6px 10px', fontSize: '0.82rem', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
                        title='Chat dengan Penjual'
                      >
                        <i className='fa-regular fa-comment-dots' />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
