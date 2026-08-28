import React, { useEffect, useState, useCallback } from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import formatCurrency from '../../utils/formatCurrency';
import api from '../../services/api';

const LS_KEY = 'ghub_wishlist'; // localStorage fallback for guests

// ── API helpers ────────────────────────────────────────────────────────────
const wishlistApi = {
  list:   ()         => api.get('/growth/wishlist'),
  add:    (productId) => api.post(`/growth/wishlist/${productId}`),
  remove: (productId) => api.delete(`/growth/wishlist/${productId}`),
};

export default function BuyerWishlist() {
  const [items, setItems]   = useState([]);
  const [toast, setToast]   = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { addToCart }       = useCart();
  const { isAuthenticated } = useAuth();

  // Load wishlist — API if authenticated, localStorage if guest
  useEffect(() => {
    let mounted = true;
    if (isAuthenticated) {
      wishlistApi.list()
        .then(r => {
          if (!mounted) return;
          const list = r?.data?.wishlist || r?.data?.items || [];
          setItems(Array.isArray(list) ? list : []);
        })
        .catch(() => {
          // Fallback to localStorage if API fails
          if (!mounted) return;
          try {
            const raw = localStorage.getItem(LS_KEY);
            setItems(raw ? JSON.parse(raw) : []);
          } catch { setItems([]); }
        })
        .finally(() => { if (mounted) setLoaded(true); });
    } else {
      try {
        const raw = localStorage.getItem(LS_KEY);
        setItems(raw ? JSON.parse(raw) : []);
      } catch { setItems([]); }
      setLoaded(true);
    }
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const remove = useCallback(async (item) => {
    const itemId = item.id || item.product_id || item.slug;
    if (isAuthenticated && (item.id || item.product_id)) {
      try {
        await wishlistApi.remove(item.product_id || item.id);
      } catch { /* continue — remove from local state anyway */ }
    } else {
      // Guest: update localStorage
      const next = items.filter(i => (i.id || i.slug) !== itemId);
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
    }
    setItems(prev => prev.filter(i => (i.id || i.product_id || i.slug) !== itemId));
    showToast('Item berhasil dihapus dari Wishlist');
  }, [items, isAuthenticated]);

  const handleAddToCart = (item) => {
    addToCart(
      {
        slug: item.slug || item.id,
        title: item.title,
        price: typeof item.price === 'number' ? item.price : 100000,
        seller: item.seller,
      },
      1
    );
    showToast(`"${item.title}" ditambahkan ke Keranjang!`);
  };

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
                  background: 'rgba(244,63,94,0.12)',
                  color: '#fb7185',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src='/assets/wishlist.png'
                  alt=''
                  style={{ width: '75%', height: '75%', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Wishlist Saya</h1>
              {loaded && items.length > 0 && (
                <span
                  style={{
                    background: 'rgba(244,63,94,0.15)',
                    color: '#fb7185',
                    fontSize: '0.78rem',
                    padding: '2px 9px',
                    borderRadius: 20,
                    fontWeight: 700,
                    border: '1px solid rgba(244,63,94,0.25)',
                  }}
                >
                  {items.length} item
                </span>
              )}
            </div>
            <p style={{ color: '#94a3b8', margin: '6px 0 0 48px', fontSize: '0.88rem' }}>
              Simpan produk dan item game impianmu untuk dibeli nanti.
            </p>
          </div>

          <Link
            to='/marketplace'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.88rem',
              background: 'rgba(255,255,255,0.03)',
              transition: 'background 0.15s ease',
            }}
          >
            <i className='fa-solid fa-store' style={{ color: '#818cf8' }} />
            <span>Jelajahi Produk</span>
          </Link>
        </div>

        {/* ── Toast Alert ── */}
        {toast && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              background: toast.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: toast.type === 'success' ? '#10b981' : '#ef4444',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
            <span>{toast.msg}</span>
          </div>
        )}

        {/* ── Wishlist Items / Empty State ── */}
        {!loaded ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.6rem', color: '#6366f1', display: 'block', marginBottom: 10 }} />
            <div style={{ color: '#64748b' }}>Memuat wishlist...</div>
          </div>
        ) : items.length === 0 ? (
          <div
            className='card'
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '56px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(244,63,94,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                fontSize: '2rem',
                color: '#fb7185',
              }}
            >
              <i className='fa-regular fa-heart' />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.2rem' }}>Wishlist kamu masih kosong</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 24px' }}>
              Temukan ribuan item game, voucher, dan akun impian di GHub lalu tambahkan ke wishlist.
            </p>
            <Link
              to='/marketplace'
              className='button primary'
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <i className='fa-solid fa-store' />
              <span>Jelajahi Marketplace Sekarang</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((it) => {
              const itemKey = it.id || it.slug;
              return (
                <div
                  key={itemKey}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 300px' }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(99,102,241,0.12) 100%)',
                        color: '#fb7185',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        flexShrink: 0,
                        border: '1px solid rgba(244,63,94,0.15)',
                      }}
                    >
                      <i className='fa-solid fa-gamepad' />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{it.title}</span>
                        {it.tag && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(99,102,241,0.15)',
                              color: '#818cf8',
                            }}
                          >
                            {it.tag}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {it.game && (
                          <span>
                            <i className='fa-solid fa-gamepad' style={{ marginRight: 4, color: '#6366f1' }} />
                            {it.game}
                          </span>
                        )}
                        {it.seller && (
                          <span>
                            <i className='fa-solid fa-shop' style={{ marginRight: 4, color: '#818cf8' }} />
                            <span style={{ color: '#94a3b8' }}>{it.seller}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.15rem' }}>
                      {typeof it.price === 'number' ? formatCurrency(it.price) : it.price}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type='button'
                        className='button small primary'
                        onClick={() => handleAddToCart(it)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}
                      >
                        <i className='fa-solid fa-cart-plus' />
                        <span>Keranjang</span>
                      </button>

                      <button
                        type='button'
                        className='button small'
                        onClick={() => remove(it)}
                        style={{
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.25)',
                          background: 'rgba(239,68,68,0.05)',
                          padding: '6px 10px',
                        }}
                        title='Hapus dari Wishlist'
                      >
                        <i className='fa-regular fa-trash-can' />
                      </button>
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
