import React from 'react';
import BuyerLayout from '../../layouts/BuyerLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BuyerSettings() {
  const { user } = useAuth();

  const settingsCards = [
    {
      title: 'Keamanan Akun & Password',
      desc: 'Ubah password akun Anda dan atur pertanyaan keamanan.',
      icon: 'fa-solid fa-key',
      color: '#6366f1',
      to: '/buyer/settings/security',
      actionText: 'Kelola Keamanan',
    },
    {
      title: 'Autentikasi Dua Faktor (2FA)',
      desc: 'Tingkatkan keamanan akun dengan verifikasi Google Authenticator / TOTP.',
      icon: 'fa-solid fa-shield-halved',
      color: '#10b981',
      to: '/buyer/settings/2fa',
      actionText: 'Atur 2FA',
    },
    {
      title: 'Manajemen Perangkat',
      desc: 'Pantau daftar perangkat yang sedang terhubung ke akun Anda.',
      icon: 'fa-solid fa-laptop',
      color: '#38bdf8',
      to: '/buyer/settings/devices',
      actionText: 'Lihat Perangkat',
    },
    {
      title: 'Aktivitas Login',
      desc: 'Riwayat login akun lengkap dengan lokasi IP dan waktu akses.',
      icon: 'fa-solid fa-clock-rotate-left',
      color: '#f59e0b',
      to: '/buyer/settings/login-activity',
      actionText: 'Lihat Aktivitas',
    },
    {
      title: 'Pengaturan Notifikasi',
      desc: 'Atur preferensi email, WhatsApp, dan notifikasi pesanan masuk.',
      icon: 'fa-regular fa-bell',
      color: '#ec4899',
      to: '/notifications/settings',
      actionText: 'Atur Notifikasi',
    },
    {
      title: 'Pusat Bantuan & Tiket',
      desc: 'Butuh bantuan dengan pesanan? Kunjungi pusat bantuan atau ajukan tiket.',
      icon: 'fa-regular fa-circle-question',
      color: '#a855f7',
      to: '/help',
      actionText: 'Buka Bantuan',
    },
  ];

  return (
    <BuyerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                src='/assets/keamanan akun.png'
                alt=''
                style={{ width: '75%', height: '75%', objectFit: 'contain' }}
              />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>Pengaturan & Keamanan</h1>
          </div>
          <p style={{ color: '#94a3b8', margin: '6px 0 0 48px', fontSize: '0.88rem' }}>
            Kontrol penuh atas privasi, keamanan sandi, sesi login, dan notifikasi akun Anda.
          </p>
        </div>

        {/* Quick Profile Summary Bar */}
        <div
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                {user?.email} • {user?.role || 'BUYER'}
              </div>
            </div>
          </div>

          <Link to='/buyer/profile' className='button small outline'>
            <i className='fa-regular fa-pen-to-square' style={{ marginRight: 6 }} />
            Edit Profil
          </Link>
        </div>

        {/* Settings Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {settingsCards.map((c, i) => (
            <div
              key={i}
              className='card'
              style={{
                background: 'var(--surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `rgba(255,255,255,0.04)`,
                    color: c.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  <i className={c.icon} />
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>{c.title}</div>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.45 }}>{c.desc}</div>
                </div>
              </div>

              <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <Link
                  to={c.to}
                  className='button small'
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{c.actionText}</span>
                  <i className='fa-solid fa-arrow-right' style={{ fontSize: '0.75rem' }} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BuyerLayout>
  );
}
