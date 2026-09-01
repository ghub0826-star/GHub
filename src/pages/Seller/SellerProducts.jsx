import React, { useEffect, useState, useCallback } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import * as sellerService from '../../services/sellerService';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const STATUS_CONFIG = {
  active:   { label: 'Aktif',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: 'fa-circle-check' },
  inactive: { label: 'Nonaktif', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  icon: 'fa-circle-pause' },
  deleted:  { label: 'Dihapus',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    icon: 'fa-circle-xmark' },
  pending:  { label: 'Review',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   icon: 'fa-clock' },
};

const MODERATION_LABELS = {
  APPROVED:       { label: 'Aktif',        color: '#10b981' },
  PENDING:        { label: 'Menunggu',     color: '#f59e0b' },
  PENDING_REVIEW: { label: 'Direview',     color: '#38bdf8' },
  REJECTED:       { label: 'Ditolak',      color: '#ef4444' },
  SUSPENDED:      { label: 'Disuspend',    color: '#94a3b8' },
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    sellerService.getProducts({ q: search, status: status || undefined })
      .then(r => {
        const list = Array.isArray(r?.data)
          ? r.data
          : (r?.data?.data || r?.data?.products || []);
        setProducts(list);
      })
      .catch(() => setError('Gagal memuat produk. Coba refresh halaman.'))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => load(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus produk "${title}"?\nTindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(id);
    setError('');
    try {
      await sellerService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || 'Gagal menghapus produk.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '1.1rem' }}>
              <i className='fa-solid fa-box-open' />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Produk Saya</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                {loading ? 'Memuat...' : `${products.length} produk`}
              </p>
            </div>
          </div>
          <Link
            to='/seller/products/new'
            className='button'
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
          >
            <i className='fa-solid fa-plus' />
            Tambah Produk
          </Link>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <i className='fa-solid fa-magnifying-glass' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem', pointerEvents: 'none' }} />
            <input
              placeholder='Cari nama produk...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36 }}
            />
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value=''>
              Semua Status
            </option>
            <option value='active'>✅ Aktif</option>
            <option value='inactive'>⏸ Nonaktif</option>
          </select>
          <button
            onClick={load}
            disabled={loading}
            className='button small cta-outline'
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate-right'}`} />
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className='error' style={{ padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className='fa-solid fa-circle-exclamation' />{error}
          </div>
        )}

        {/* ── Product List ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, height: 80, border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            <i className='fa-solid fa-box-open' style={{ fontSize: '2.2rem', color: '#334155', display: 'block', marginBottom: 14 }} />
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
              {search || status ? 'Tidak ada produk yang sesuai filter' : 'Belum ada produk'}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 auto 20px', maxWidth: 360 }}>
              {search || status
                ? 'Coba ubah kata kunci atau filter status produk.'
                : 'Mulai tambahkan produk pertama Anda untuk berjualan di GHub.'}
            </p>
            {!search && !status && (
              <Link to='/seller/products/new' className='button' style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <i className='fa-solid fa-plus' /> Tambah Produk Pertama
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map(p => {
              const statusConf = STATUS_CONFIG[p.status] || STATUS_CONFIG.inactive;
              const modConf    = MODERATION_LABELS[p.moderation_status] || null;
              return (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, padding: '14px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: 16, flexWrap: 'wrap', transition: 'border-color 0.15s',
                  }}
                >
                  {/* Left: thumbnail + info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 240px', minWidth: 0 }}>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                    ) : (
                      <div style={{ width: 54, height: 54, borderRadius: 10, flexShrink: 0, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className='fa-solid fa-image' style={{ color: '#818cf8', fontSize: '1.2rem' }} />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </div>
                      {(p.game || p.game_name) && (
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2 }}>
                          <i className='fa-solid fa-gamepad' style={{ marginRight: 5 }} />
                          {p.game || p.game_name}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, background: statusConf.bg, color: statusConf.color }}>
                          <i className={`fa-solid ${statusConf.icon}`} style={{ fontSize: '0.6rem' }} />
                          {statusConf.label}
                        </span>
                        {modConf && p.moderation_status !== 'APPROVED' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: modConf.color }}>
                            {modConf.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: price + stock + actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{formatCurrency(p.price)}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      <i className='fa-solid fa-cubes-stacked' style={{ marginRight: 5 }} />
                      Stok: {p.stock}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      <Link
                        to={`/seller/products/${p.id}/edit`}
                        className='button small'
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: '0.82rem' }}
                      >
                        <i className='fa-solid fa-pen-to-square' /> Edit
                      </Link>
                      <button
                        className='button small'
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deleting === p.id}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: '0.82rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
                      >
                        <i className={`fa-solid ${deleting === p.id ? 'fa-circle-notch fa-spin' : 'fa-trash-can'}`} />
                        {deleting === p.id ? 'Menghapus...' : 'Hapus'}
                      </button>
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
