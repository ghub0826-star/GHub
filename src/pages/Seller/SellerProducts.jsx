import React, { useEffect, useState, useCallback } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import * as sellerService from '../../services/sellerService';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const STATUS_LABELS = {
  active:   { label: 'Aktif',    color: 'green' },
  inactive: { label: 'Nonaktif', color: 'gray'  },
  deleted:  { label: 'Dihapus',  color: 'red'   },
};

export default function SellerProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null); // id of product being deleted
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');

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
      .catch(() => setError('Gagal memuat produk.'))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    let timer = setTimeout(() => load(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus produk "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
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
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Produk Saya</h1>
          <Link to="/seller/products/new" className="button">+ Tambah Produk</Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}

        {/* Product list */}
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div className="card">Memuat produk...</div>
          ) : products.length === 0 ? (
            <div className="card">
              {search || status ? 'Tidak ada produk yang sesuai filter.' : 'Belum ada produk. Silakan tambah produk baru.'}
            </div>
          ) : (
            products.map(p => {
              const statusInfo = STATUS_LABELS[p.status] || { label: p.status, color: 'gray' };
              return (
                <div
                  key={p.id}
                  className="card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
                >
                  {/* Left: thumbnail + info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                      />
                    )}
                    <div>
                      <strong>{p.title}</strong>
                      <div className="muted" style={{ fontSize: 13 }}>{p.game || p.game_name}</div>
                      <div style={{ marginTop: 2 }}>
                        <span style={{ color: statusInfo.color, fontSize: 12, fontWeight: 600 }}>
                          ● {statusInfo.label}
                        </span>
                        {p.moderation_status && p.moderation_status !== 'APPROVED' && (
                          <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                            [{p.moderation_status}]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: price + stock + actions */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(p.price)}</div>
                    <div className="muted" style={{ fontSize: 13 }}>Stok: {p.stock}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link to={`/seller/products/${p.id}/edit`} className="button small">
                        Edit
                      </Link>
                      <button
                        className="button small cta-outline"
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deleting === p.id}
                        style={{ color: 'var(--danger, #ef4444)' }}
                      >
                        {deleting === p.id ? '...' : 'Hapus'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
