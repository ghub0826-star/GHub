import React, { useEffect, useState } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function SellerStore(){
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/seller/profile')
      .then((res) => {
        if (mounted) setStore(res.data);
      })
      .catch(() => {
        if (mounted) setStore(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <SellerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Toko Saya</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '0.88rem' }}>
            Informasi profil dan pengaturan toko Anda di GHub Marketplace.
          </p>
        </div>

        {loading ? (
          <div className='card' style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
            <i className='fa-solid fa-circle-notch fa-spin' style={{ fontSize: '1.5rem', color: '#6366f1', display: 'block', marginBottom: 10 }} />
            Memuat data toko...
          </div>
        ) : store ? (
          <div className='card' style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
              }}
            >
              {store.shop_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.3rem' }}>
                {store.shop_name || store.store_name || user?.username}
              </h2>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                {store.description || 'Toko resmi seller GHub Marketplace'}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: '#64748b' }}>
                <span>Status: <strong style={{ color: store.is_online ? '#10b981' : '#94a3b8' }}>{store.is_online ? 'Online' : 'Offline'}</strong></span>
                {store.rating && <span>Rating: <strong style={{ color: '#f59e0b' }}>★ {store.rating}</strong></span>}
              </div>
            </div>
          </div>
        ) : (
          <div className='card' style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏪</div>
            <h3 style={{ margin: '0 0 6px', color: '#fff' }}>Toko Belum Didaftarkan</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 auto 20px', maxWidth: 360 }}>
              Daftarkan tokomu sekarang untuk mulai menjual produk game di GHub Marketplace.
            </p>
            <Link to='/seller/register' className='button primary'>
              Daftar Jadi Seller
            </Link>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
